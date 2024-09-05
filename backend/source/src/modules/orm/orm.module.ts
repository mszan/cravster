import { MikroORM } from "@mikro-orm/core";
import { Global, Module } from "@nestjs/common";
import ormConfig from "./orm.config";

export const ORM = "ORM";

/**
 * Custom ORM module. This is only an abstraction layer over out-of-box NestJS module.
 *
 * As it is very explicitly written, some day it may
 * become handy one day when we add e.g.: ORM repositories.
 */
@Global()
@Module({
  exports: [ORM],
  imports: [],
  providers: [
    {
      provide: ORM,
      useFactory: async () => await MikroORM.init(ormConfig),
    },
  ],
})
export class OrmModule {}
