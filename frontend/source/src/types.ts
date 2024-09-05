export enum UserRole {
    ADMIN = "ADMIN",
    USER = "USER",
}

export interface IUser {
    username: string;
    id: string;
}

export interface IAccessTokenPayload {
    roles: UserRole[];
    user: IUser;
    iat: number;
    exp: number;
}

export interface IRefreshTokenPayload {
    user: IUser;
}

export type OrEmptyStrings<T> = {
    [P in keyof T]: T[P] | "";
};
