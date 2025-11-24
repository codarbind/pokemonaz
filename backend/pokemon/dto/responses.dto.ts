import { ApiProperty } from '@nestjs/swagger';
import { Favorite } from 'pokemon/entities/favorites.entity';
import { PokemonEvolutionStep } from 'pokemon/interfaces/pokemon.interface';

export class PokemonResponseDto {
  @ApiProperty({ example: 1, description: 'Pokemon ID' })
  id: number;

  @ApiProperty({ example: 'bulbasaur', description: 'Pokemon name' })
  name: string;

  @ApiProperty({ 
    example: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
    description: 'Pokemon sprite URL' 
  })
  sprite: string;
}

export class PokemonListResponseDto {
  @ApiProperty({ type: [PokemonResponseDto], description: 'List of Pokemon' })
  data: PokemonResponseDto[];

  @ApiProperty({ example: 150, description: 'Total number of Pokemon' })
  total: number;
}

export class PokemonStatDto {
@ApiProperty({ example: 'hp', description: 'Stat name' })
name: string;

@ApiProperty({ example: 45, description: 'Base stat value' })
value: number;
}

export class PokemonDetailResponseDto {
@ApiProperty({ example: 1, description: 'Pokemon ID' })
id: number;

@ApiProperty({ example: 'bulbasaur', description: 'Pokemon name' })
name: string;

@ApiProperty({
example:
'[https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png](https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png)',
description: 'Pokemon sprite URL',
})
sprite: string;

@ApiProperty({
example: ['grass', 'poison'],
description: 'Pokemon types',
type: [String],
})
types: string[];

@ApiProperty({
example: ['overgrow', 'chlorophyll'],
description: 'Pokemon abilities',
type: [String],
})
abilities: string[];

@ApiProperty({
example: [
{ stat: 'hp', base_stat: 45 },
{ stat: 'attack', base_stat: 49 },
{ stat: 'defense', base_stat: 49 },
],
description: 'Pokemon base stats',
type: [PokemonStatDto],
})
stats: PokemonStatDto[];

@ApiProperty({
example: ['bulbasaur', 'ivysaur', 'venusaur'],
description: 'Evolution chain',
type: [String],
})
evolutionChain: PokemonEvolutionStep[];
}


export class PokemonDetailWrapperDto {
  @ApiProperty({ type: PokemonDetailResponseDto })
  data: PokemonDetailResponseDto;
}

export class FavoriteIdsResponseDto {
  @ApiProperty({ 
    example: [1, 4, 7, 25],
    description: 'Array of favorite Pokemon IDs',
    type: [Number]
  })
  data: number[];
}

export class SuccessResponseDto {
  @ApiProperty({ example: true, description: 'Operation success status' })
  success: boolean;

  @ApiProperty({ example: 'Pokemon added to favorites', description: 'Response message' })
  message: string;

  @ApiProperty({ type: Favorite, description: 'Favorite Pokemon data', required: false })
  data?: Favorite;
}

export class ErrorResponseDto {
  @ApiProperty({ example: false, description: 'Operation success status' })
  success: boolean;

  @ApiProperty({ example: 404, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({ example: '2024-01-01T10:00:00.000Z', description: 'Timestamp' })
  timestamp: string;

  @ApiProperty({ example: '/pokemon/999', description: 'Request path' })
  path: string;

  @ApiProperty({ example: 'Pokemon not found', description: 'Error message' })
  message: string;
}