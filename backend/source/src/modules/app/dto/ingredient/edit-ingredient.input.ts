import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional, IsPositive, IsString, MaxLength } from "class-validator";
import { IngredientCategory, IngredientUnit } from "../../../../schema/entities/ingredient.entity";

export class EditIngredientInput {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  id!: string;

  @ApiProperty({ maxLength: 255, required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiProperty({ required: false, enumName: "IngredientCategory", enum: IngredientCategory })
  @IsEnum(IngredientCategory)
  @IsOptional()
  category?: IngredientCategory;

  @ApiProperty({ required: false, enumName: "IngredientUnit", enum: IngredientUnit })
  @IsEnum(IngredientUnit)
  @IsOptional()
  unit?: IngredientUnit;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsPositive()
  storageAmount?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsPositive()
  shoppingAmount?: number;
}
