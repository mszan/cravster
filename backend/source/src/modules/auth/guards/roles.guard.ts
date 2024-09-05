import { CanActivate, ExecutionContext, Injectable, Logger } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { IAccessTokenStrategyUserObject } from "../../../schema/interfaces/jwt";
import { UserRole } from "../../../schema/interfaces/user-role";
import { ForbiddenException, JwtMalformedException, UnauthorizedException } from "../../app/errors/errors";
import { ROLES_KEY } from "../decorators/require-roles.decorator";

/**
 * Compares the roles assigned to the current user to the actual
 * roles required by the current route being processed.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  private logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Obtain JWT payload.
    const strategyPayload: IAccessTokenStrategyUserObject = context.switchToHttp().getRequest().user;

    // If component protected (by @Route) requires roles, check for their presence in the metadata.
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If component is not protected (not decorated by @Route), do not for check for roles since they are not required.
    if (!requiredRoles) {
      return true;
    }

    // Check if JWT has the payload.
    if (!strategyPayload?.tokenPayload) {
      this.logger.debug("No JWT payload.");
      throw new UnauthorizedException();
    }

    // Check if JWT has roles in the payload.
    if (!strategyPayload?.tokenPayload.roles) {
      this.logger.debug("No roles in JWT payload.");
      throw new JwtMalformedException();
    }

    // Check if user has required roles and in case not, return an Apollo error.
    if (!requiredRoles.some(role => strategyPayload?.tokenPayload.roles?.includes(role))) {
      this.logger.debug(
        `Roles required by resolver: ${requiredRoles}. Roles user has: ${strategyPayload?.tokenPayload.roles}.`,
      );
      throw new ForbiddenException();
    }

    // Let the user move on.
    return true;
  }
}
