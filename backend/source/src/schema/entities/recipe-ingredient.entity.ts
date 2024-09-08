import { Entity, ManyToOne, Property } from "@mikro-orm/core";
import { BaseEntity } from "./base.entity";
import { IngredientEntity } from "./ingredient.entity";
import { RecipeEntity } from "./recipe.entity";

@Entity()
export class RecipeIngredientEntity extends BaseEntity {
  @ManyToOne({ entity: () => RecipeEntity, nullable: false, primary: true })
  recipe!: RecipeEntity;

  @ManyToOne({ entity: () => IngredientEntity, nullable: false, primary: true })
  ingredient!: IngredientEntity;

  @Property({ nullable: false })
  amount!: number;
}
