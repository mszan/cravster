import { faker } from "@faker-js/faker/locale/en";
import { EntityManager } from "@mikro-orm/core";
import { Seeder } from "@mikro-orm/seeder";
import { Logger } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import fs from "fs";
import _ from "lodash";
import * as Minio from "minio";
import path from "path";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import { IngredientEntity, IngredientCategory, IngredientUnit } from "../../../schema/entities/ingredient.entity";
import { PhotoEntity } from "../../../schema/entities/photo.entity";
import { RecipeIngredientEntity } from "../../../schema/entities/recipe-ingredient.entity";
import { RecipeEntity } from "../../../schema/entities/recipe.entity";
import { UserEntity } from "../../../schema/entities/user.entity";
import { UserRole } from "../../../schema/interfaces/user-role";
import { configInstance } from "../../app/app.config";
import { UploadedFileInfo } from "../../app/services/storage.service";

const minioClient = new Minio.Client({
  endPoint: configInstance.storage.endPoint,
  port: configInstance.storage.port,
  useSSL: configInstance.storage.useSSL,
  accessKey: configInstance.storage.accessKey,
  secretKey: configInstance.storage.secretKey,
});

export class DatabaseSeeder extends Seeder {
  private logger = new Logger(DatabaseSeeder.name);

  async uploadPhoto(path: string): Promise<UploadedFileInfo> {
    this.logger.log(`Uploading photo '${path}'...`);
    const photoBuffer = fs.readFileSync(path);
    const filename = `${uuidv4()}.webp`;

    // full size
    this.logger.log(`> Uploading FULL photo size...`);
    const uploadedObjectInfo = await minioClient.putObject(
      configInstance.storage.buckets["photos"].name,
      filename,
      await sharp(photoBuffer).toFormat("webp").toBuffer(),
      {
        "Content-Type": "image/webp",
      },
    );
    this.logger.log(`> Uploading FULL photo size: DONE.`);

    // resized - w 100, h auto
    this.logger.log(`> Uploading w100 photo size...`);
    await minioClient.putObject(
      configInstance.storage.buckets["photos"].name,
      "w100_" + filename,
      await sharp(photoBuffer).toFormat("webp").resize(100).toBuffer(),
      {
        "Content-Type": "image/webp",
      },
    );
    this.logger.log(`> Uploading w100 photo size: DONE.`);

    return {
      object: uploadedObjectInfo,
      path: `/${filename}`,
      filename: filename,
    };
  }

  async run(em: EntityManager): Promise<void> {
    this.logger.log(`Running...`);

    // users
    const userImUser = new UserEntity();
    userImUser.username = "imUser";
    userImUser.password = bcrypt.hashSync("Test@1234", 10);
    userImUser.roles = [UserRole.USER];
    em.persist(userImUser);

    // users
    const userImAdmin = new UserEntity();
    userImAdmin.username = "imAdmin";
    userImAdmin.password = bcrypt.hashSync("Test@1234", 10);
    userImAdmin.roles = [UserRole.ADMIN];
    em.persist(userImAdmin);

    // ingredients
    const ingredients: IngredientEntity[] = [];
    const INGREDIENTS_AMOUNT = 50;
    for (let i = 1; i <= INGREDIENTS_AMOUNT; i++) {
      const ingredient = new IngredientEntity();
      ingredient.name = faker.food.ingredient();
      ingredient.category = _.sample(Object.keys(IngredientCategory)) as IngredientCategory;
      ingredient.unit = _.sample(Object.keys(IngredientUnit)) as IngredientUnit;
      ingredient.storageAmount = faker.number.int({ min: 0, max: 700 });
      ingredient.shoppingAmount = faker.number.int({ min: 0, max: 700 });
      ingredient.user = userImUser;
      ingredients.push(ingredient);
    }
    em.persist(ingredients);

    // recipes
    const RECIPES_AMOUNT = 12;
    for (let i = 1; i <= RECIPES_AMOUNT; i++) {
      const recipe = new RecipeEntity();
      recipe.description = faker.food.description();
      recipe.title = faker.food.dish();
      recipe.user = userImUser;
      const photoFromStorage = await this.uploadPhoto(path.join(__dirname, "assets", "recipes", `${i.toString()}.jpg`));
      const photo = new PhotoEntity();
      photo.path = photoFromStorage.path;
      photo.filename = photoFromStorage.filename;
      photo.user = userImUser;
      recipe.photo = photo;

      const recipeIngredients: RecipeIngredientEntity[] = [];
      for (let j = 1; j <= faker.number.int({ min: 1, max: 5 }); j++) {
        const recipeIngredient = new RecipeIngredientEntity();
        recipeIngredient.ingredient = _.sample(ingredients)!;
        recipeIngredient.amount = faker.number.int({ min: 10, max: 500, multipleOf: 10 });
        recipeIngredient.recipe = recipe;
        recipeIngredients.push(recipeIngredient);
      }

      em.persist([recipe, ...recipeIngredients]);
    }

    this.logger.log(`Done.`);
  }
}
