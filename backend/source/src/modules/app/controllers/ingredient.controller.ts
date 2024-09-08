import { UniqueConstraintViolationException as ORMUniqueConstraintViolationException } from "@mikro-orm/core";
import { MikroORM } from "@mikro-orm/postgresql";
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { ApiOperation, ApiProduces, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { IngredientCategory, IngredientEntity } from "../../../schema/entities/ingredient.entity";
import { IUser } from "../../../schema/interfaces/jwt";
import { UserRole } from "../../../schema/interfaces/user-role";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { ORM } from "../../orm/orm.module";
import { Roles } from "../decorators/roles.decorator";
import { DeleteByUuidInput } from "../dto/delete-by-uuid.input";
import { AddIngredientInput } from "../dto/ingredient/add-ingredient.input";
import { EditIngredientInput } from "../dto/ingredient/edit-ingredient.input";
import { PaginatedIngredientEntity } from "../dto/paginated-entities";
import { exceptionDataSet, FileExtensionInvalidException, UniqueConstraintViolationException } from "../errors/errors";
import { mapEntitiesToPaginatedDto } from "../helpers/map-entities-to-paginated-dto.helper";
import { UserEntity } from "../../../schema/entities/user.entity";

@ApiTags("ingredient")
@Controller("ingredient")
@Roles([UserRole.USER])
export class IngredientController {
  @Inject(ORM) private readonly orm: MikroORM;

  @ApiOperation({ summary: "Get ingredient list" })
  @ApiResponse({
    status: HttpStatus.OK,
    type: PaginatedIngredientEntity,
  })
  @ApiQuery({
    name: "offset",
    type: Number,
    required: false,
    example: 0,
  })
  @ApiQuery({
    name: "limit",
    type: Number,
    required: false,
    example: 5,
  })
  @Get("")
  async ingredientList(
    @Query("offset") offset: number,
    @Query("limit") limit: number,
    @CurrentUser() user: IUser,
  ): Promise<PaginatedIngredientEntity> {
    const ingredients = await this.orm.em.find<IngredientEntity>(
      IngredientEntity,
      { user: { id: user.id } },
      {
        orderBy: { name: "ASC" },
        offset,
        limit,
      },
    );

    // Using QB to avoid big call stack and thus improve performance.
    const qb = this.orm.em.createQueryBuilder(IngredientEntity);
    const ingredientsTotal = await qb.count();

    return mapEntitiesToPaginatedDto(ingredients, offset, limit, ingredientsTotal);
  }

  @ApiOperation({ summary: "Get shopping list" })
  @ApiResponse({
    status: HttpStatus.OK,
    type: String,
  })
  @ApiProduces("text/plain")
  @Get("shopping-list")
  async ingredientShoppingList(@CurrentUser() user: IUser): Promise<string> {
    const ingredients = await this.orm.em.find<IngredientEntity>(
      IngredientEntity,
      { user: { id: user.id }, shoppingAmount: { $gt: 0 } },
      {
        orderBy: { name: "ASC" },
      },
    );

    let shoppingList = "";
    Object.keys(IngredientCategory)
      .sort()
      .forEach(category => {
        const ingredientsInCategory = ingredients.filter(ingredient => ingredient.category === category);
        if (ingredientsInCategory.length > 0) {
          shoppingList += `\n${category}:\n`;
          ingredientsInCategory.forEach(ingredient => {
            shoppingList += `\t${ingredient.name} - ${ingredient.shoppingAmount} ${ingredient.unit.toLowerCase()}\n`;
          });
        }
      });

    return shoppingList;
  }

  @ApiOperation({
    summary: "Add ingredient",
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: IngredientEntity,
  })
  @ApiResponse({
    status: exceptionDataSet.UNIQUE_CONSTRAINT_VIOLATION.httpStatus,
    type: UniqueConstraintViolationException,
  })
  @ApiResponse({
    status: exceptionDataSet.FILE_EXTENSION_INVALID.httpStatus,
    type: FileExtensionInvalidException,
  })
  @Post("")
  async ingredientAdd(@Body() input: AddIngredientInput, @CurrentUser() user: IUser): Promise<IngredientEntity> {
    const ingredient = new IngredientEntity();
    ingredient.name = input.name;
    ingredient.category = input.category;
    ingredient.unit = input.unit;
    ingredient.storageAmount = input.storageAmount;
    ingredient.shoppingAmount = input.shoppingAmount;
    ingredient.user = this.orm.em.getReference(UserEntity, user.id);

    try {
      await this.orm.em.persistAndFlush(ingredient);
    } catch (e) {
      if (e instanceof ORMUniqueConstraintViolationException) {
        throw new UniqueConstraintViolationException();
      }
      throw e;
    }

    return ingredient;
  }

  @ApiOperation({
    summary: "Edit ingredient",
  })
  @ApiResponse({
    status: exceptionDataSet.UNIQUE_CONSTRAINT_VIOLATION.httpStatus,
    type: UniqueConstraintViolationException,
  })
  @ApiResponse({
    status: exceptionDataSet.FILE_EXTENSION_INVALID.httpStatus,
    type: FileExtensionInvalidException,
  })
  @Patch("")
  async ingredientEdit(@Body() input: EditIngredientInput): Promise<void> {
    const ingredient = await this.orm.em.findOne(IngredientEntity, { id: input.id });

    if (!ingredient) {
      throw new NotFoundException();
    }

    input.name !== undefined ? (ingredient.name = input.name) : null;
    input.category !== undefined ? (ingredient.category = input.category) : null;
    input.unit !== undefined ? (ingredient.unit = input.unit) : null;
    input.storageAmount !== undefined ? (ingredient.storageAmount = input.storageAmount) : null;
    input.shoppingAmount !== undefined ? (ingredient.shoppingAmount = input.shoppingAmount) : null;

    this.orm.em.persistAndFlush(ingredient);

    return; // todo: some serialization issues here (with the photos), CPU goes up to 100 perc. figure it out.
  }

  @ApiOperation({
    summary: "Get ingredient details",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: IngredientEntity,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: NotFoundException,
  })
  @Get(":id")
  async ingredientDetails(@Param("id") id: string, @CurrentUser() user: IUser): Promise<IngredientEntity> {
    const ingredient = await this.orm.em.findOne(IngredientEntity, { user: { id: user.id }, id });
    if (!ingredient) {
      throw new NotFoundException();
    }

    return ingredient;
  }

  @ApiOperation({
    summary: "Delete ingredient",
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: IngredientEntity,
    isArray: false,
  })
  @Delete("")
  async ingredientRemove(@Body() input: DeleteByUuidInput, @CurrentUser() user: IUser): Promise<IngredientEntity> {
    const ingredient = await this.orm.em.findOne(IngredientEntity, { user: { id: user.id }, id: input.id });
    if (!ingredient) {
      throw new NotFoundException();
    }

    await this.orm.em.removeAndFlush(ingredient);
    return ingredient;
  }
}
