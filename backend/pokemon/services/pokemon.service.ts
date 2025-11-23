import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { Favorite } from 'pokemon/entities/favorites.entity';
import { PokemonListResponse, PokemonDetailResponse, PokeApiPokemon, PokeApiSpecies, EvolutionChainResponse, PokemonDetail, ChainLink } from 'pokemon/interfaces/pokemon.interface';


@Injectable()
export class PokemonService {
  private readonly pokeApiBase = 'https://pokeapi.co/api/v2';

  constructor(
    @InjectModel(Favorite.name) private favoriteModel: Model<Favorite>,
    private readonly httpService: HttpService,
  ) {}

  async getPokemonList(): Promise<PokemonListResponse> {
    try {
      const response = await lastValueFrom(
        this.httpService.get(`${this.pokeApiBase}/pokemon?limit=150`)
      );

      const pokemonList = await Promise.all(
        response.data.results.map(async (pokemon: any, index: number) => {
          const id = index + 1;
          return {
            id,
            name: pokemon.name,
            sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
          };
        })
      );

      return {
        data: pokemonList,
        total: pokemonList.length,
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
      // Fetch basic Pokemon data
      const pokemonResponse = await lastValueFrom(
        this.httpService.get<PokeApiPokemon>(`${this.pokeApiBase}/pokemon/${id}`)
      );

      const pokemonData = pokemonResponse.data;

      // Fetch species data for evolution chain
      const speciesResponse = await lastValueFrom(
        this.httpService.get<PokeApiSpecies>(`${this.pokeApiBase}/pokemon-species/${id}`)
      );

      const speciesData = speciesResponse.data;

      const evolutionChainUrl = speciesData.evolution_chain.url;
      
      // Fetch evolution chain
      const evolutionResponse = await lastValueFrom(
        this.httpService.get<EvolutionChainResponse>(evolutionChainUrl)
      );

      const evolutionChain = this.parseEvolutionChain(evolutionResponse.data);

      const pokemonDetail: PokemonDetail = {
        id: pokemonData.id,
        name: pokemonData.name,
        sprite: pokemonData.sprites.other['official-artwork'].front_default || pokemonData.sprites.front_default,
        types: pokemonData.types.map((typeInfo) => typeInfo.type.name),
        abilities: pokemonData.abilities.map((abilityInfo) => abilityInfo.ability.name),
        evolutionChain,
      };

      return { data: pokemonDetail };
    } catch (error) {
      console.error('Error fetching Pokemon details:', error);
      if (error.response?.status === 404) {
        throw new HttpException('Pokemon not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'Failed to fetch Pokemon details',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  private parseEvolutionChain(evolutionData: EvolutionChainResponse): string[] {
    const chain: string[] = [];
    
    const extractChain = (chainLink: ChainLink) => {
      chain.push(chainLink.species.name);
      if (chainLink.evolves_to && chainLink.evolves_to.length > 0) {
        // Take the first evolution path (most Pokemon have linear evolution)
        extractChain(chainLink.evolves_to[0]);
      }
    };

    extractChain(evolutionData.chain);
    return chain;
  }

  async searchPokemon(name: string): Promise<PokemonListResponse> {
    try {
      const allPokemon = await this.getPokemonList();
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