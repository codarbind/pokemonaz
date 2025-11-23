import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { PokemonController } from './controller/pokemon.controller';
import { Favorite, FavoriteSchema } from './entities/favorites.entity';
import { PokemonService } from './services/pokemon.service';


@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: Favorite.name, schema: FavoriteSchema },
    ]),
  ],
  controllers: [PokemonController],
  providers: [PokemonService],
})
export class PokemonModule {}