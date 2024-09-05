import { createParamDecorator, ExecutionContext, Logger } from "@nestjs/common";
import { IAccessTokenStrategyUserObject, IUser } from "../../../schema/interfaces/jwt";
import { InternalException } from "../../app/errors/errors";

export const CurrentUser = createParamDecorator<unknown, ExecutionContext, IUser>((_, ctx): IUser => {
  const logger = new Logger(CurrentUser.name);

  const req = ctx.switchToHttp().getRequest();
  const userObject: IAccessTokenStrategyUserObject = req.user;

  if (userObject.tokenPayload.user) {
    return userObject.tokenPayload.user;
  }

  logger.error("Could not parse the user object.");
  throw new InternalException();
});
