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
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import { AnyFilesInterceptor } from "@nestjs/platform-express";
import { ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { PhotoEntity } from "../../../schema/entities/photo.entity";
import { RecipeEntity } from "../../../schema/entities/recipe.entity";
import { UserEntity } from "../../../schema/entities/user.entity";
import { IUser } from "../../../schema/interfaces/jwt";
import { UserRole } from "../../../schema/interfaces/user-role";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { ORM } from "../../orm/orm.module";
import { Roles } from "../decorators/roles.decorator";
import { DeleteByUuidInput } from "../dto/delete-by-uuid.input";
import { PaginatedRecipeInList } from "../dto/paginated-entities";
import { AddRecipeInput } from "../dto/recipe/add-recipe.input";
import { EditRecipeInput } from "../dto/recipe/edit-recipe.input";
import { RecipeInList } from "../dto/recipe/recipe-in-list";
import { exceptionDataSet, FileExtensionInvalidException, UniqueConstraintViolationException } from "../errors/errors";
import { mapEntitiesToPaginatedDto } from "../helpers/map-entities-to-paginated-dto.helper";
import { multerOptionsForPhoto } from "../helpers/multer-options-for-photo.helper";
import { StorageService, UploadedFileInfo } from "../services/storage.service";

@ApiTags("recipe")
@Controller("recipe")
@Roles([UserRole.USER])
export class RecipeController {
  @Inject(ORM) private readonly orm: MikroORM;
  @Inject() private readonly storageService: StorageService;

  @ApiOperation({ summary: "Get recipe list" })
  @ApiResponse({
    status: HttpStatus.OK,
    type: PaginatedRecipeInList,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: NotFoundException,
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
  async recipeList(
    @Query("offset") offset: number,
    @Query("limit") limit: number,
    @CurrentUser() user: IUser,
  ): Promise<PaginatedRecipeInList> {
    const recipesEntities = await this.orm.em.find<RecipeEntity>(
      RecipeEntity,
      { user: { id: user.id } },
      {
        orderBy: { title: "ASC", recipeIngredients: { ingredient: { name: "ASC" } } },
        offset,
        populate: ["photo", "recipeIngredients", "recipeIngredients.ingredient"] as never,
        limit,
      },
    );

    const userEntity = await this.orm.em.findOne(
      UserEntity,
      { id: user.id },
      { populate: ["ingredients"], fields: ["ingredients"] },
    );

    if (!userEntity) {
      throw new NotFoundException();
    }

    const recipes: RecipeInList[] = [];
    for (const recipeEntity of recipesEntities) {
      const ingredients: { isInStorage: boolean; amount: number; unit: string; name: string }[] =
        recipeEntity.recipeIngredients.map(ri => {
          const userIngredient = userEntity.ingredients.find(i => i.id === ri.ingredient.id);
          const isInStorage = (userIngredient && ri.amount <= userIngredient.storageAmount) || false;
          return { isInStorage, amount: ri.amount, unit: ri.ingredient.unit, name: ri.ingredient.name };
        });

      recipes.push({
        id: recipeEntity.id,
        title: recipeEntity.title,
        description: recipeEntity.description,
        photo: recipeEntity.photo
          ? {
              filename: recipeEntity.photo?.filename,
              path: recipeEntity.photo?.path,
            }
          : null,
        ingredients,
      });
    }

    // Using QB to avoid big call stack and thus improve performance.
    const qb = this.orm.em.createQueryBuilder(RecipeEntity);
    const recipesTotal = await qb.count();

    return mapEntitiesToPaginatedDto<RecipeInList>(recipes, offset, limit, recipesTotal);
  }

  @ApiOperation({
    summary: "Add recipe",
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: RecipeEntity,
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
  async recipeAdd(@Body() input: AddRecipeInput, @CurrentUser() user: IUser): Promise<RecipeEntity> {
    const recipe = new RecipeEntity();
    recipe.title = input.title;
    recipe.user = this.orm.em.getReference(UserEntity, user.id);

    try {
      await this.orm.em.persistAndFlush(recipe);
    } catch (e) {
      if (e instanceof ORMUniqueConstraintViolationException) {
        throw new UniqueConstraintViolationException();
      }
      throw e;
    }

    return recipe;
  }

  @UseInterceptors(AnyFilesInterceptor(multerOptionsForPhoto))
  @ApiConsumes("multipart/form-data")
  @ApiOperation({
    summary: "Edit recipe",
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
  async recipeEdit(@Body() input: EditRecipeInput, @UploadedFiles() files: Array<Express.Multer.File>): Promise<void> {
    const recipe = await this.orm.em.findOne(RecipeEntity, { id: input.id });

    if (!recipe) {
      throw new NotFoundException();
    }

    input.title !== undefined ? (recipe.title = input.title) : null;
    input.description !== undefined ? (recipe.description = input.description) : null;

    let uploadedNewPhotoInfo!: UploadedFileInfo; // note the "!" here
    const newPhoto = files?.find(file => file.fieldname === "photo");

    if (newPhoto) {
      // remove old photo
      if (recipe.photo) {
        await this.storageService.deletePhoto(recipe.photo.filename, "photos").then(async () => {
          uploadedNewPhotoInfo = await this.storageService.uploadPhoto(newPhoto, "photos");
        });
      } else {
        uploadedNewPhotoInfo = await this.storageService.uploadPhoto(newPhoto, "photos");
      }

      const photo = new PhotoEntity();
      photo.filename = uploadedNewPhotoInfo.filename;
      photo.path = uploadedNewPhotoInfo.path;
      photo.recipe = recipe;
      this.orm.em.persist([photo, recipe]);
    }

    try {
      await this.orm.em.flush();
    } catch (e) {
      if (newPhoto) {
        // rollback uploaded file (simply remove it)
        await this.storageService.deletePhoto(uploadedNewPhotoInfo.filename, "photos");
      }
      if (e instanceof ORMUniqueConstraintViolationException) {
        throw new UniqueConstraintViolationException();
      }
      throw e;
    }

    return; // todo: some serialization issues here (with the photos), CPU goes up to 100 perc. figure it out.
  }

  @ApiOperation({
    summary: "Get recipe details",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: RecipeEntity,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: NotFoundException,
  })
  @Get(":id")
  async recipeDetails(@Param("id") id: string, @CurrentUser() user: IUser): Promise<RecipeEntity> {
    const recipe = await this.orm.em.findOne(RecipeEntity, { user: { id: user.id }, id });
    if (!recipe) {
      throw new NotFoundException();
    }

    return recipe;
  }

  @ApiOperation({
    summary: "Delete recipe",
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: RecipeEntity,
    isArray: false,
  })
  @Delete("")
  async recipeRemove(@Body() input: DeleteByUuidInput, @CurrentUser() user: IUser): Promise<RecipeEntity> {
    const recipe = await this.orm.em.findOne(RecipeEntity, { user: { id: user.id }, id: input.id });
    if (!recipe) {
      throw new NotFoundException();
    }

    await this.orm.em.removeAndFlush(recipe);
    return recipe;
  }
}
