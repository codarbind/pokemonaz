import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ timestamps: true })
export class Favorite extends Document {
  @ApiProperty({ example: 25, description: 'Pokemon ID' })
  @Prop({ required: true, index: true })
  pokemonId: number;

  @ApiProperty({ example: 'pikachu', description: 'Pokemon name' })
  @Prop({ required: true })
  name: string;

  @ApiProperty({ 
    example: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
    description: 'Pokemon sprite URL' 
  })
  @Prop({ required: true })
  sprite: string;

  @ApiProperty()
  @Prop()
  createdAt?: Date;

  @ApiProperty()
  @Prop()
  updatedAt?: Date;
}

export const FavoriteSchema = SchemaFactory.createForClass(Favorite);