import { Entity, Enum, ManyToOne, Property } from "@mikro-orm/core";
import { ApiProperty } from "@nestjs/swagger";
import { Base } from "./base.entity";
import { User } from "./user.entity";

export enum IngredientCategory {
  ALCOHOL = "ALCOHOL",
  DRY_GOODS = "DRY_GOODS",
  CHEMICALS = "CHEMICALS",
  CAKES_DESSERTS_ADDONS = "CAKES_DESSERTS_ADDONS",
  READY_MEALS = "READY_MEALS",
  COFFEE = "COFFEE",
  MEAT_DELI = "MEAT_DELI",
  FROZEN_FOODS_ICE_CREAM = "FROZEN_FOODS_ICE_CREAM",
  DAIRY = "DAIRY",
  BREAD = "BREAD",
  FISH = "FISH",
  SWEETS = "SWEETS",
  FATS = "FATS",
  FRUITS_VEGETABLES = "FRUITS_VEGETABLES",
  OTHER = "OTHER",
}

export enum IngredientUnit {
  GRAM = "GRAM",
  KILOGRAM = "KILOGRAM",
  LITER = "LITER",
  MILLILITER = "MILLILITER",
  PIECE = "PIECE",
}

@Entity()
export class Ingredient extends Base {
  @ManyToOne({ entity: () => User, nullable: false })
  user!: User;

  @ApiProperty({ maxLength: 255, nullable: false })
  @Property({ length: 255, nullable: false })
  name!: string;

  @ApiProperty({ enum: IngredientCategory, enumName: "IngredientCategory", nullable: false })
  @Enum({ nullable: false })
  category!: IngredientCategory;

  @ApiProperty({ enum: IngredientUnit, enumName: "IngredientUnit", nullable: false })
  @Enum({ nullable: false })
  unit!: IngredientUnit;

  @ApiProperty({ nullable: false })
  @Property({ nullable: false })
  storageAmount!: number;

  @ApiProperty({ nullable: false })
  @Property({ nullable: false })
  shoppingAmount?: number;
}
