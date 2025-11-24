import {
  Controller,
  Get,
  Param,
  Query,
  Post,
  Delete,
  Body,
  ParseIntPipe,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiServiceUnavailableResponse
} from '@nestjs/swagger';
import { AddFavoriteDto } from 'pokemon/dto/add-favorite.dto';
import { ErrorResponseDto, PokemonListResponseDto, PokemonDetailWrapperDto, SuccessResponseDto, FavoriteIdsResponseDto } from 'pokemon/dto/responses.dto';
import { SearchDto } from 'pokemon/dto/search.dto';
import { Favorite } from 'pokemon/entities/favorites.entity';
import { PokemonService } from 'pokemon/services/pokemon.service';



@ApiTags('Pokemon')
@Controller('pokemon')
@ApiResponse({ status: 500, description: 'Internal server error', type: ErrorResponseDto })
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) { }

  @Get()
  @ApiOperation({
    summary: 'Get Pokemons',
    description: 'Retrieves a paginated list of Pokemons from PokeAPI'
  })
  @ApiOkResponse({
    description: 'Successfully retrieved Pokemon list',
    type: PokemonListResponseDto
  })
  @ApiServiceUnavailableResponse({
    description: 'PokeAPI service unavailable',
    type: ErrorResponseDto
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'perPage', required: false, example: 12 })
  async getAllPokemon(
    @Query('page') page = 1,
    @Query('perPage') perPage = 12
  ): Promise<PokemonListResponseDto> {
    return this.pokemonService.getPokemonList(page, perPage);
  }


  @Get('search')
  @ApiOperation({
    summary: 'Search Pokemon by name',
    description: 'Search Pokemon by name. Returns all Pokemon if no search term provided.'
  })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    description: 'Pokemon name to search for (min 2 characters)'
  })
  @ApiOkResponse({
    description: 'Successfully retrieved matching Pokemon',
    type: PokemonListResponseDto
  })
  @ApiBadRequestResponse({
    description: 'Invalid search parameter',
    type: ErrorResponseDto
  })
  async searchPokemon(@Query() searchDto: SearchDto): Promise<PokemonListResponseDto> {
    if (!searchDto.name) {
      return this.pokemonService.getPokemonList();
    }
    return this.pokemonService.searchPokemon(searchDto.name);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get detailed Pokemon information',
    description: 'Retrieves detailed information about a specific Pokemon including types, abilities, and evolution chain'
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Pokemon ID',
    example: 1
  })
  @ApiOkResponse({
    description: 'Successfully retrieved Pokemon details',
    type: PokemonDetailWrapperDto
  })
  @ApiNotFoundResponse({
    description: 'Pokemon not found',
    type: ErrorResponseDto
  })
  @ApiBadRequestResponse({
    description: 'Invalid Pokemon ID',
    type: ErrorResponseDto
  })
  @ApiServiceUnavailableResponse({
    description: 'PokeAPI service unavailable',
    type: ErrorResponseDto
  })
  async getPokemonById(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }))
    id: number
  ): Promise<PokemonDetailWrapperDto> {
    return this.pokemonService.getPokemonDetail(id);
  }


  
  @Get('favorites/list')
  @ApiOperation({
    summary: 'Get all favorite Pokemon',
    description: 'Retrieves all Pokemon marked as favorites from the database'
  })
  @ApiOkResponse({
    description: 'Successfully retrieved favorite Pokemon',
    type: [Favorite]
  })
  async getFavorites(): Promise<Favorite[]> {
    return this.pokemonService.getFavorites();
  }

  @Post('favorites')
  @ApiOperation({
    summary: 'Add a Pokemon to favorites',
    description: 'Adds a Pokemon to the favorites list. Pokemon must exist in the first 150.'
  })
  @ApiBody({
    type: AddFavoriteDto,
    description: 'Pokemon ID to add to favorites'
  })
  @ApiCreatedResponse({
    description: 'Successfully added Pokemon to favorites',
    type: SuccessResponseDto
  })
  @ApiConflictResponse({
    description: 'Pokemon already in favorites',
    type: ErrorResponseDto
  })
  @ApiBadRequestResponse({
    description: 'Invalid Pokemon ID',
    type: ErrorResponseDto
  })
  @ApiNotFoundResponse({
    description: 'Pokemon not found in PokeAPI',
    type: ErrorResponseDto
  })
  async addFavorite(@Body() addFavoriteDto: AddFavoriteDto): Promise<SuccessResponseDto> {

    const favorite = await this.pokemonService.addFavorite(addFavoriteDto.pokemonId);
    return {
      success: true,
      message: 'Pokemon added to favorites',
      data: favorite,
    };
  }

  @Delete('favorites/:pokemonId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remove Pokemon from favorites',
    description: 'Removes a Pokemon from the favorites list using its ID'
  })
  @ApiParam({
    name: 'pokemonId',
    type: Number,
    description: 'Pokemon ID to remove from favorites',
    example: 25
  })
  @ApiNoContentResponse({
    description: 'Successfully removed Pokemon from favorites'
  })
  @ApiNotFoundResponse({
    description: 'Pokemon not found in favorites',
    type: ErrorResponseDto
  })
  @ApiBadRequestResponse({
    description: 'Invalid Pokemon ID',
    type: ErrorResponseDto
  })
  async removeFavorite(
    @Param('pokemonId', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }))
    pokemonId: number
  ): Promise<void> {
    await this.pokemonService.removeFavorite(pokemonId);
  }

  @Post('favorites/reset')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Reset all favorites',
    description: 'Removes all Pokemon from the favorites list'
  })
  @ApiNoContentResponse({
    description: 'Successfully cleared all favorites'
  })
  async resetFavorites(): Promise<void> {
    await this.pokemonService.resetFavorites();
  }

  @Get('favorites/ids')
  @ApiOperation({
    summary: 'Get list of favorite Pokemon IDs',
    description: 'Retrieves an array of all favorited Pokemon IDs for quick lookup'
  })
  @ApiOkResponse({
    description: 'Successfully retrieved favorite Pokemon IDs',
    type: FavoriteIdsResponseDto
  })
  async getFavoriteIds(): Promise<FavoriteIdsResponseDto> {
    const ids = await this.pokemonService.getFavoriteIds();
    return { data: ids };
  }
}