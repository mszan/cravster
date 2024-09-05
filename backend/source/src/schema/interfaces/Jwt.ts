import { UserRole } from "./user-role";

export interface IUser {
  username: string;
  id: string;
}

export interface IAccessTokenStrategyUserObject {
  tokenPayload: IAccessTokenPayload;
}

export interface IAccessTokenPayload {
  roles: UserRole[];
  user: IUser;
}

export interface IRefreshTokenStrategyUserObject {
  tokenPayload: IRefreshTokenPayload;
}

export interface IRefreshTokenPayload {
  user: IUser;
}
