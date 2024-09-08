import { Options } from "@mikro-orm/core";
import { TsMorphMetadataProvider } from "@mikro-orm/reflection";
import { Logger } from "@nestjs/common";
import { configInstance, NodeEnv } from "../app/app.config";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";

const entitiesPath = "/opt/source/dist/src/schema/entities/**/*.js";
const entitiesTsPath = __dirname + "/../../schema/entities/**/*.ts";
export const logger = new Logger(`ORM`);

// logger.debug(`${Object.keys({ entitiesPath })[0]}: ${entitiesPath}`);
// logger.debug(`${Object.keys({ entitiesTsPath })[0]}: ${entitiesTsPath}`);

// Mikro-ORM configuration object.
export default {
  user: configInstance.database.user,
  password: configInstance.database.password,
  dbName: configInstance.database.database,
  host: configInstance.database.host,
  port: Number(configInstance.database.port),
  driver: PostgreSqlDriver,

  // Enable debug for every environment but production.
  debug: configInstance.app.environment != NodeEnv.PRODUCTION,
  metadataProvider: TsMorphMetadataProvider,
  logger: logger.debug.bind(logger),
  cache: { options: { cacheDir: "./tmp/orm_cache" } },
  forceUtcTimezone: true,

  entities: [entitiesPath],
  entitiesTs: [entitiesTsPath],

  migrations: {
    path: "./src/modules/orm/migrations",
    tableName: "migrations",
    transactional: true,
    snapshot: false,
  },

  seeder: {
    path: "./src/modules/orm/seeder",
    defaultSeeder: "DatabaseSeeder",
  },
} as Options;
