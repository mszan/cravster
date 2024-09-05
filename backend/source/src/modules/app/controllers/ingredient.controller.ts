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
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Ingredient } from "../../../schema/entities/ingredient.entity";
import { IUser } from "../../../schema/interfaces/jwt";
import { UserRole } from "../../../schema/interfaces/user-role";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { ORM } from "../../orm/orm.module";
import { Roles } from "../decorators/roles.decorator";
import { DeleteByUuidInput } from "../dto/common/delete-by-uuid.input";
import { AddIngredientInput } from "../dto/ingredient/input/add-ingredient";
import { EditIngredientInput } from "../dto/ingredient/input/edit-ingredient.input";
import { PaginatedIngredient } from "../dto/paginated-entities";
import { exceptionDataSet, FileExtensionInvalidException, UniqueConstraintViolationException } from "../errors/errors";
import { mapEntitiesToPaginatedDto } from "../helpers/map-entities-to-paginated-dto.helper";

@ApiTags("ingredient")
@Controller("ingredient")
@Roles([UserRole.USER])
export class IngredientController {
  @Inject(ORM) private readonly orm: MikroORM;

  @ApiOperation({ summary: "Get ingredient list" })
  @ApiResponse({
    status: HttpStatus.OK,
    type: PaginatedIngredient,
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
  ): Promise<PaginatedIngredient> {
    const ingredients = await this.orm.em.find<Ingredient>(
      Ingredient,
      { user: { id: user.id } },
      {
        orderBy: { name: "ASC" },
        offset,
        limit,
      },
    );

    // Using QB to avoid big call stack and thus improve performance.
    const qb = this.orm.em.createQueryBuilder(Ingredient);
    const ingredientsTotal = await qb.count();

    return mapEntitiesToPaginatedDto(ingredients, offset, limit, ingredientsTotal);
  }

  @ApiOperation({
    summary: "Add ingredient",
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: Ingredient,
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
  async ingredientAdd(@Body() input: AddIngredientInput): Promise<Ingredient> {
    const ingredient = new Ingredient();
    ingredient.name = input.name;
    ingredient.category = input.category;
    ingredient.unit = input.unit;
    ingredient.storageAmount = input.storageAmount;
    ingredient.shoppingAmount = input.shoppingAmount;

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
    const ingredient = await this.orm.em.findOne(Ingredient, { id: input.id });

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
    type: Ingredient,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: NotFoundException,
  })
  @Get(":id")
  async ingredientDetails(@Param("id") id: string, @CurrentUser() user: IUser): Promise<Ingredient> {
    const ingredient = await this.orm.em.findOne(Ingredient, { user: { id: user.id }, id });
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
    type: Ingredient,
    isArray: false,
  })
  @Delete("")
  async ingredientRemove(@Body() input: DeleteByUuidInput, @CurrentUser() user: IUser): Promise<Ingredient> {
    const ingredient = await this.orm.em.findOne(Ingredient, { user: { id: user.id }, id: input.id });
    if (!ingredient) {
      throw new NotFoundException();
    }

    await this.orm.em.removeAndFlush(ingredient);
    return ingredient;
  }
}
