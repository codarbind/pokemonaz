import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength, MaxLength } from 'class-validator';

export class SearchDto {
  @ApiPropertyOptional({
    example: 'pika',
    description: 'Search by Pokemon name (min 2 characters)',
    minLength: 2,
    maxLength: 50
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name?: string;
}