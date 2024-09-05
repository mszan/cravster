import { applyDecorators, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiResponse } from "@nestjs/swagger";
import { UserRole } from "../../../schema/interfaces/user-role";
import { RequireRoles } from "../../auth/decorators/require-roles.decorator";
import { AccessTokenGuard } from "../../auth/guards/access-token.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import {
  exceptionDataSet,
  ForbiddenException,
  JwtExpiredException,
  JwtMalformedException,
  UnauthorizedException,
} from "../errors/errors";

export function Roles(roles: UserRole[]) {
  return applyDecorators(
    UseGuards(AccessTokenGuard, RolesGuard),
    RequireRoles(roles),
    ApiResponse({
      status: exceptionDataSet.FORBIDDEN.httpStatus,
      type: ForbiddenException,
    }),
    ApiResponse({
      status: exceptionDataSet.UNAUTHORIZED.httpStatus,
      type: UnauthorizedException,
    }),
    ApiResponse({
      status: exceptionDataSet.JWT_EXPIRED.httpStatus,
      type: JwtExpiredException,
    }),
    ApiResponse({
      status: exceptionDataSet.JWT_MALFORMED.httpStatus,
      type: JwtMalformedException,
    }),
    ApiBearerAuth(),
  );
}
