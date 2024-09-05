import { createParamDecorator, ExecutionContext, Logger } from "@nestjs/common";
import { IAccessTokenStrategyUserObject } from "../../../schema/interfaces/jwt";
import { InternalException } from "../../app/errors/errors";

export const CurrentAccessTokenStrategyUserObject = createParamDecorator<
  unknown,
  ExecutionContext,
  IAccessTokenStrategyUserObject
>((_, ctx): IAccessTokenStrategyUserObject => {
  const logger = new Logger(CurrentAccessTokenStrategyUserObject.name);

  const req = ctx.switchToHttp().getRequest();
  const userObject: IAccessTokenStrategyUserObject = req.user;

  if (userObject) {
    return userObject;
  }

  logger.error("Could not parse the user object.");
  throw new InternalException();
});
