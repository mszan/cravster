import { CustomDecorator, SetMetadata } from "@nestjs/common";
import { UserRole } from "../../../schema/interfaces/user-role";

export const ROLES_KEY = "roles";
/**
 * Route handler (method) Decorator.
 *
 * Attaches custom roles metadata to route handlers.
 * This metadata supplies missing ``role`` data, which a roles guard needs to make decisions.
 */
export const RequireRoles = (roles: UserRole[]): CustomDecorator<string> => {
  return SetMetadata(ROLES_KEY, roles);
};
