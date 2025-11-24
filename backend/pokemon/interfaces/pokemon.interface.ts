export interface Pokemon {
  id: number;
  name: string;
  sprite: string;
}

export interface PokemonStat {
  name: string;
  value: number;
}

export interface PokemonEvolutionStep {
  name: string;
  sprite: string;
  types: string[];
  method: string;
  details: string;
  trigger: string
  requirements: string | null
}

export interface PokemonDetail {
  id: number;
  name: string;
  sprite: string;
  types: string[];
  abilities: string[];
  evolutionChain: PokemonEvolutionStep[];
  stats: PokemonStat[];
}

export interface PokemonListResponse {
  data: Pokemon[];
  total: number;
}

export interface PokemonDetailResponse {
  data: PokemonDetail;
}

export interface FavoriteResponse {
  success: boolean;
  message: string;
  data?: any;
}

// Corrected Evolution Chain Interfaces
export interface EvolutionChainResponse {
  chain: ChainLink;
}

export interface ChainLink {
  species: {
    name: string;
    url: string;
  };
  evolves_to: ChainLink[];
  evolution_details?: any[];
}

export interface PokeApiPokemon {
  stats: PokemonStat[];
  id: number;
  name: string;
  sprites: {
    front_default: string;
    other: {
      'official-artwork': {
        front_default: string;
      };
    };
  };
  types: Array<{
    slot: number;
    type: {
      name: string;
      url: string;
    };
  }>;
  abilities: Array<{
    ability: {
      name: string;
      url: string;
    };
    is_hidden: boolean;
    slot: number;
  }>;
}

export interface PokeApiSpecies {
  evolution_chain: {
    url: string;
  };
}