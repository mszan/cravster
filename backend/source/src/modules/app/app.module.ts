import { HttpModule } from "@nestjs/axios";
import { MiddlewareConsumer, Module, ModuleMetadata, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER } from "@nestjs/core";
import { ScheduleModule } from "@nestjs/schedule";
import { MinioModule } from "nestjs-minio-client";
import { AuthModule } from "../auth/auth.module";
import { OrmMiddleware } from "../orm/orm.middleware";
import { OrmModule } from "../orm/orm.module";
import { configFactory, configInstance } from "./app.config";
import { AppController } from "./controllers/app.controller";
import { IngredientController } from "./controllers/ingredient.controller";
import { UserController } from "./controllers/user.controller";
import { ExceptionFilter } from "./errors/filters/exception.filter";
import { ReqResLogMiddleware } from "./middlewares/req-res-log.middleware";
import { FeatureFlagsService } from "./services/feature-flags.service";
import { InMemoryCacheService } from "./services/in-memory-cache.service";
import { SchedulerService } from "./services/scheduler.service";
import { StorageService } from "./services/storage.service";

export const moduleMetadata: ModuleMetadata = {
  imports: [
    // NEST MODULES
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configFactory],
    }),
    HttpModule.register({
      validateStatus: function (status: number) {
        return status >= 200 && status < 400; // default
      },
    }),
    ScheduleModule.forRoot(),

    // THIRD-PARTY MODULES
    MinioModule.register({
      endPoint: configInstance.storage.endPoint,
      port: configInstance.storage.port,
      useSSL: configInstance.storage.useSSL,
      accessKey: configInstance.storage.accessKey,
      secretKey: configInstance.storage.secretKey,
    }),

    AuthModule,
    OrmModule,
  ],
  controllers: [AppController, IngredientController, UserController],
  providers: [
    StorageService,
    SchedulerService,
    InMemoryCacheService,
    FeatureFlagsService,
    {
      provide: APP_FILTER,
      useClass: ExceptionFilter,
    },
  ],
};

@Module(moduleMetadata)
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(ReqResLogMiddleware).forRoutes("*");
    consumer.apply(OrmMiddleware).forRoutes("*");
  }
}
