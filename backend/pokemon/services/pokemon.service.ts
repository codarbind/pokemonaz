import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { Favorite } from 'pokemon/entities/favorites.entity';
import { PokemonListResponse, PokemonDetailResponse, PokeApiPokemon, PokeApiSpecies, EvolutionChainResponse, PokemonDetail, ChainLink, PokemonEvolutionStep, PokemonStat } from 'pokemon/interfaces/pokemon.interface';
import { getRandomInt } from 'utils/intgen';


@Injectable()
export class PokemonService {
  private readonly pokeApiBase = 'https://pokeapi.co/api/v2';

  constructor(
    @InjectModel(Favorite.name) private favoriteModel: Model<Favorite>,
    private readonly httpService: HttpService,
  ) { }

  async getPokemonList(
    page = 1,
    perPage = 12
  ): Promise<PokemonListResponse> {
    try {
      const offset = (page - 1) * perPage;
      const response = await lastValueFrom(
        this.httpService.get(`${this.pokeApiBase}/pokemon?limit=${perPage}&offset=${offset}`)
      );

      const fullList = response.data.results.map((pokemon: any, index: number) => {
        const id = pokemon.url.split('/pokemon/')[1].split('/')[0];
        return {
          id,
          name: pokemon.name,
          sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
        };
      });

      return {
        data: fullList,
        total: response.data.count,
      };

    } catch (error) {
      throw new HttpException(
        'Failed to fetch Pokemon list',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }


  async getPokemonDetail(id: number): Promise<PokemonDetailResponse> {
    try {
      const pokemonResponse = await lastValueFrom(
        this.httpService.get<PokeApiPokemon>(`${this.pokeApiBase}/pokemon/${id}`)
      );

      const pokemonData = pokemonResponse.data;

      const stats: PokemonStat[] = pokemonData.stats.map((s: any) => ({
        name: s.stat.name,
        value: s.base_stat,
      }));


      const speciesResponse = await lastValueFrom(
        this.httpService.get<PokeApiSpecies>(`${this.pokeApiBase}/pokemon-species/${id}`)
      );

      const speciesData = speciesResponse.data;
      const evolutionChainUrl = speciesData.evolution_chain.url;

      const evolutionResponse = await lastValueFrom(
        this.httpService.get<EvolutionChainResponse>(evolutionChainUrl)
      );

      const evolutionSteps = this.parseEvolutionChain(evolutionResponse.data);

      // Fetch types for each evolution step
      for (const step of evolutionSteps) {
        const evoId = this.extractPokemonId(
          `https://pokeapi.co/api/v2/pokemon/${step.name}`
        ) || getRandomInt(1, 100);

        const evoResponse = await lastValueFrom(
          this.httpService.get<PokeApiPokemon>(`${this.pokeApiBase}/pokemon/${evoId}`)
        );

        const evoData = evoResponse.data;

        step.types = evoData.types.map((t: any) => t.type.name);
      }

      const pokemonDetail: PokemonDetail = {
        id: pokemonData.id,
        name: pokemonData.name,
        sprite: pokemonData.sprites.other["official-artwork"].front_default
          || pokemonData.sprites.front_default,
        types: pokemonData.types.map((t) => t.type.name),
        abilities: pokemonData.abilities.map((a) => a.ability.name),
        evolutionChain: evolutionSteps,
        stats
      };

      return { data: pokemonDetail };
    } catch (error) {
      console.error("Error fetching Pokemon details:", error);

      if (error.response?.status === 404) {
        throw new HttpException("Pokemon not found", HttpStatus.NOT_FOUND);
      }

      throw new HttpException(
        "Failed to fetch Pokemon details",
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }


  private parseEvolutionChain(chainData: EvolutionChainResponse): PokemonEvolutionStep[] {
    const steps: PokemonEvolutionStep[] = [];

    const parseDetails = (details: any[]): {
      method: string;
      details: string;
      trigger: string;
      requirements: string | null;
    } => {
      // Base starter
      if (!details || details.length === 0) {
        return {
          method: "Base Form",
          details: "This is the first stage.",
          trigger: "Base",
          requirements: null,
        };
      }

      const d = details[0];

      const trigger = this.titleCase(d.trigger.name.replace("-", " "));
      const reqs: string[] = [];

      // Build automatic method & default details
      let method = trigger;
      let detailsText = `Evolves via ${trigger.toLowerCase()}.`;

      //
      // --------------------------
      // LEVEL-UP EVOLUTION
      // --------------------------
      //
      if (d.trigger.name === "level-up") {
        if (d.min_level) {
          method = `Level ${d.min_level}`;
          detailsText = `Level up at level ${d.min_level}.`;
          reqs.push(`Requires level ${d.min_level}`);
        } else {
          method = "Level Up";
        }

        if (d.time_of_day) {
          reqs.push(`Must occur at ${d.time_of_day}`);
          detailsText += ` Must occur during the ${d.time_of_day}.`;
        }

        if (d.min_happiness) {
          reqs.push(`Needs happiness ≥ ${d.min_happiness}`);
        }

        if (d.min_beauty) {
          reqs.push(`Needs beauty ≥ ${d.min_beauty}`);
        }

        if (d.min_affection) {
          reqs.push(`Needs affection ≥ ${d.min_affection}`);
        }

        if (d.needs_overworld_rain) {
          reqs.push(`It must be raining`);
        }

        if (d.turn_upside_down) {
          reqs.push(`Device must be held upside down while leveling`);
        }
      }

      //
      // --------------------------
      // USE-ITEM EVOLUTION
      // --------------------------
      //
      if (d.trigger.name === "use-item" && d.item?.name) {
        const item = this.titleCase(d.item.name.replace("-", " "));
        method = `${item} Item`;
        detailsText = `Use a ${item} to evolve.`;
        reqs.push(`Must use ${item}`);
      }

      //
      // --------------------------
      // TRADE EVOLUTION
      // --------------------------
      //
      if (d.trigger.name === "trade") {
        method = "Trade";
        detailsText = "Trade this Pokémon to evolve.";
        reqs.push("Trade required");

        if (d.held_item?.name) {
          const item = this.titleCase(d.held_item.name.replace("-", " "));
          reqs.push(`Must hold ${item}`);
          detailsText += ` Must be holding ${item}.`;
        }
      }

      //
      // --------------------------
      // OTHER CONDITIONS
      // --------------------------
      //
      if (d.gender === 1) reqs.push("Female only");
      if (d.gender === 2) reqs.push("Male only");

      if (d.location?.name) {
        const loc = this.titleCase(d.location.name.replace("-", " "));
        reqs.push(`Must be at ${loc}`);
      }

      if (d.known_move?.name) {
        const move = this.titleCase(d.known_move.name.replace("-", " "));
        reqs.push(`Must know move ${move}`);
      }

      if (d.known_move_type?.name) {
        const type = this.titleCase(d.known_move_type.name);
        reqs.push(`Must know a ${type}-type move`);
      }

      if (d.party_species?.name) {
        const ally = this.titleCase(d.party_species.name);
        reqs.push(`Must have ${ally} in party`);
      }

      if (d.party_type?.name) {
        const t = this.titleCase(d.party_type.name);
        reqs.push(`Must have a ${t}-type Pokémon in party`);
      }

      return {
        method,
        details: detailsText,
        trigger,
        requirements: reqs.length > 0 ? reqs.join("; ") : null,
      };
    };

    const traverse = (node: ChainLink) => {
      const { method, details, trigger, requirements } = parseDetails(node.evolution_details || []);

      steps.push({
        name: node.species.name,
        sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${this.extractPokemonId(
          node.species.url
        )}.png`,
        types: [],  // to be filled later
        method,
        details,
        trigger,
        requirements,
      });

      if (node.evolves_to && node.evolves_to.length > 0) {
        node.evolves_to.forEach((child) => traverse(child));
      }
    };

    traverse(chainData.chain);

    return steps;
  }



  // Extract ID from URL like "https://pokeapi.co/api/v2/pokemon/1/"
  private extractPokemonId(url: string): number {
    const parts = url.split("/").filter(Boolean);
    return Number(parts[parts.length - 1]);
  }

  private titleCase(str: string): string {
    return str.replace(/\w\S*/g, (txt) =>
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }



  async searchPokemon(name: string): Promise<PokemonListResponse> {
    try {
      const allPokemon = await this.getPokemonList(1,1000000);
      const filtered = allPokemon.data.filter(pokemon =>
        pokemon.name.toLowerCase().includes(name.toLowerCase())
      );

      return {
        data: filtered,
        total: filtered.length,
      };
    } catch (error) {
      throw new HttpException(
        'Search failed',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getFavorites(): Promise<Favorite[]> {
    return this.favoriteModel.find().sort({ createdAt: -1 }).exec();
  }

  async addFavorite(pokemonId: number): Promise<Favorite> {
    // Check if already favorited
    const existing = await this.favoriteModel.findOne({ pokemonId });
    if (existing) {
      throw new HttpException(
        'Pokemon already in favorites',
        HttpStatus.CONFLICT
      );
    }

    // Fetch Pokemon data to cache name and sprite
    try {
      const pokemonDetail = await this.getPokemonDetail(pokemonId);

      const favorite = new this.favoriteModel({
        pokemonId,
        name: pokemonDetail.data.name,
        sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`,
      });

      return favorite.save();
    } catch (error) {
      throw new HttpException(
        'Failed to fetch Pokemon details for favoriting',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async removeFavorite(pokemonId: number): Promise<void> {
    const result = await this.favoriteModel.findOneAndDelete({ pokemonId });
    if (!result) {
      throw new HttpException(
        'Pokemon not found in favorites',
        HttpStatus.NOT_FOUND
      );
    }
  }

  async resetFavorites(): Promise<void> {
    await this.favoriteModel.deleteMany({});
  }

  async getFavoriteIds(): Promise<number[]> {
    const favorites = await this.favoriteModel.find().select('pokemonId').exec();
    return favorites.map(fav => fav.pokemonId);
  }
}