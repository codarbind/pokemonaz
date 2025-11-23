import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, Max } from 'class-validator';

export class AddFavoriteDto {
  @ApiProperty({
    example: 25,
    description: 'Pokemon ID as provided by PokeAPI',
    minimum: 1,
    maximum: 151
  })
  @IsInt()
  @Min(1)
  @Max(151)
  pokemonId: number;
}