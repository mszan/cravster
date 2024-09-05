import { createParamDecorator, ExecutionContext, Logger } from "@nestjs/common";
import { InternalException } from "../../app/errors/errors";

export const CurrentBearer = createParamDecorator<unknown, ExecutionContext, string>((_, ctx): string => {
  const logger = new Logger(CurrentBearer.name);

  const req = ctx.switchToHttp().getRequest();
  const bearer = req.headers["authorization"].replace("Bearer", "").trim();
  if (bearer) {
    return bearer;
  }

  logger.error("Could not parse the bearer.");
  throw new InternalException();
});
