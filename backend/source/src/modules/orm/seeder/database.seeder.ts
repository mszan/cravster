import { EntityManager } from "@mikro-orm/core";
import { faker, Seeder } from "@mikro-orm/seeder";
import { Logger } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import fs from "fs";
import * as Minio from "minio";
import path from "path";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import { Photo } from "../../../schema/entities/photo.entity";
import { Recipe } from "../../../schema/entities/recipe.entity";
import { User } from "../../../schema/entities/user.entity";
import { UserRole } from "../../../schema/interfaces/user-role";
import { configInstance } from "../../app/app.config";
import { UploadedFileInfo } from "../../app/services/storage.service";
import { Ingredient, IngredientCategory, IngredientUnit } from "../../../schema/entities/ingredient.entity";
import _ from "lodash";

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

    return {
      object: uploadedObjectInfo,
      path: `/${filename}`,
      filename: filename,
    };
  }

  async run(em: EntityManager): Promise<void> {
    this.logger.log(`Running...`);

    // users
    const userImUser = new User();
    userImUser.username = "imUser";
    userImUser.password = bcrypt.hashSync("Test@1234", 10);
    userImUser.roles = [UserRole.USER];
    em.persist(userImUser);

    // users
    const userImAdmin = new User();
    userImAdmin.username = "imAdmin";
    userImAdmin.password = bcrypt.hashSync("Test@1234", 10);
    userImAdmin.roles = [UserRole.ADMIN];
    em.persist(userImAdmin);

    // recipes
    const RECIPES_AMOUNT = 2;
    for (let i = 1; i <= RECIPES_AMOUNT; i++) {
      const recipe = new Recipe();
      recipe.description = faker.lorem.paragraph(15);
      recipe.title = faker.lorem.sentence(1);
      recipe.user = userImUser;

      const photoFromStorage = await this.uploadPhoto(path.join(__dirname, "assets", "recipes", `${i.toString()}.jpg`));
      const photo = new Photo();
      photo.path = photoFromStorage.path;
      photo.filename = photoFromStorage.filename;
      photo.user = userImUser;
      recipe.photo = photo;
      em.persist(recipe);
    }

    // ingredients
    const INGREDIENTS_AMOUNT = 50;
    for (let i = 1; i <= INGREDIENTS_AMOUNT; i++) {
      const ingredient = new Ingredient();
      ingredient.name = faker.lorem.word();
      ingredient.category = _.sample(Object.keys(IngredientCategory)) as IngredientCategory;
      ingredient.unit = _.sample(Object.keys(IngredientUnit)) as IngredientUnit;
      ingredient.storageAmount = parseInt(faker.random.numeric());
      ingredient.shoppingAmount = parseInt(faker.random.numeric());
      ingredient.user = userImUser;
      em.persist(ingredient);
    }

    this.logger.log(`Done.`);
  }
}
