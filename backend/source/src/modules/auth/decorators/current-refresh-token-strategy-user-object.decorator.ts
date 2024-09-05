import { createParamDecorator, ExecutionContext, Logger } from "@nestjs/common";
import { IRefreshTokenStrategyUserObject } from "../../../schema/interfaces/jwt";
import { InternalException } from "../../app/errors/errors";

export const CurrentRefreshTokenStrategyUserObject = createParamDecorator<
  unknown,
  ExecutionContext,
  IRefreshTokenStrategyUserObject
>((_, ctx): IRefreshTokenStrategyUserObject => {
  const logger = new Logger(CurrentRefreshTokenStrategyUserObject.name);

  const req = ctx.switchToHttp().getRequest();
  const userObject: IRefreshTokenStrategyUserObject = req.user;

  if (userObject) {
    return userObject;
  }

  logger.error("Could not parse the user object.");
  throw new InternalException();
});
