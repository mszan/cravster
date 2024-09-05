import { MikroORM, RequestContext } from "@mikro-orm/core";
import { Inject, Injectable, NestMiddleware } from "@nestjs/common";
import { IncomingMessage, ServerResponse } from "http";
import { ORM } from "./orm.module";

@Injectable()
export class OrmMiddleware implements NestMiddleware {
  @Inject(ORM)
  private readonly orm: MikroORM;

  // Create ORM context for every incomming request.
  // A complete description of ORM context concept can be found here:
  // https://mikro-orm.io/docs/identity-map#-requestcontext-helper
  use(_req: IncomingMessage, _res: ServerResponse, next: (...args: unknown[]) => void) {
    RequestContext.create([this.orm.em], next);
  }
}
