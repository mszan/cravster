import { ApiProperty } from "@nestjs/swagger";
import { IPaginatedType, PageInfo, Paginated } from "./pagination";
import { RecipeEntity } from "../../../schema/entities/recipe.entity";
import { IngredientEntity } from "../../../schema/entities/ingredient.entity";
import { RecipeInList } from "./recipe/recipe-in-list";

export class PaginatedRecipeEntity extends Paginated(RecipeEntity) {} // todo: replace with public class
export class PaginatedIngredientEntity extends Paginated(IngredientEntity) {} // todo: replace with public class

export class PaginatedRecipeInList extends Paginated(RecipeInList) {}

export class PaginatedEntity<T> implements IPaginatedType<T> {
  @ApiProperty({ type: PageInfo })
  pageInfo: PageInfo;

  @ApiProperty({ isArray: true, type: Array<T> })
  result: Array<T>;

  @ApiProperty({ description: "Total count of returned records." })
  totalCount: number;
}
