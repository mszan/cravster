import { ApiProperty } from "@nestjs/swagger";
import { IPaginatedType, PageInfo, Paginated } from "./pagination";
import { Recipe } from "../../../schema/entities/recipe.entity";
import { Ingredient } from "../../../schema/entities/ingredient.entity";

export class PaginatedRecipe extends Paginated(Recipe) {}
export class PaginatedIngredient extends Paginated(Ingredient) {}

export class PaginatedEntity<T> implements IPaginatedType<T> {
  @ApiProperty({ type: PageInfo })
  pageInfo: PageInfo;

  @ApiProperty({ isArray: true, type: Array<T> })
  result: Array<T>;

  @ApiProperty({ description: "Total count of returned records." })
  totalCount: number;
}
