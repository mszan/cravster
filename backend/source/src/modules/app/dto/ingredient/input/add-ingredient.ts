import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsPositive, IsString, MaxLength } from "class-validator";
import { IngredientCategory, IngredientUnit } from "../../../../../schema/entities/ingredient.entity";

export class AddIngredientInput {
  @ApiProperty({ maxLength: 255, required: true })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name!: string;

  @ApiProperty({ required: true, enum: IngredientCategory })
  @IsEnum(IngredientCategory)
  @IsNotEmpty()
  category!: IngredientCategory;

  @ApiProperty({ required: true, enum: IngredientUnit })
  @IsEnum(IngredientUnit)
  @IsNotEmpty()
  unit!: IngredientUnit;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsPositive()
  storageAmount!: number;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsPositive()
  shoppingAmount!: number;
}
