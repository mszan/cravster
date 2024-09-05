import jwt_decode from "jwt-decode";
import { useSnackbar } from "notistack";
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService, LoginLocalResponse } from "../client/generated";
import { useLocalStorage } from "../hooks/use-local-storage.hook";
import { IAccessTokenPayload, IUser, UserRole } from "../types";
import { Typography } from "antd";

export interface AuthContextInterface {
    user: IUser | null;
    login: (username: string, password: string) => Promise<LoginLocalResponse>;
    logout: () => void;
    getUserRoles: () => UserRole[];
    getDecodedAccessToken: () => IAccessTokenPayload | null;
    isAccessTokenExpired: () => boolean;
}

export const authContextDefaults: AuthContextInterface = {
    user: null,
    getUserRoles: () => [],
    login: async () => ({ accessToken: "", refreshToken: "" }),
    logout: () => null,
    getDecodedAccessToken: () => null,
    isAccessTokenExpired: () => true,
};

export const AuthContext = React.createContext<AuthContextInterface>(authContextDefaults);

export const AuthContextProvider = ({ children }: any) => {
    const navigate = useNavigate();
    const [user, setUser] = useLocalStorage<any>("user", null);
    const { enqueueSnackbar } = useSnackbar();

    const login = async (username: string, password: string): Promise<LoginLocalResponse> => {
        const res = await AuthService.authControllerLogin({
            username: username,
            password: password,
        }).catch(err => {
            enqueueSnackbar(<Typography.Text>Login failed.</Typography.Text>, {
                variant: "error",
                autoHideDuration: 4000,
            });
            throw err;
        });
        setUser(res);
        return res;
    };

    const logout = (): void => {
        setUser(null);
        navigate("/login", { replace: true });
    };

    const getDecodedAccessToken = (): IAccessTokenPayload => {
        return jwt_decode(user.accessToken);
    };

    const isAccessTokenExpired = (): boolean => {
        if (Date.now() >= getDecodedAccessToken().exp * 1000) {
            return true;
        }
        return false;
    };

    const getUserRoles = (): UserRole[] => {
        return getDecodedAccessToken().roles;
    };

    const value = useMemo(
        () => ({
            user,
            getUserRoles,
            login,
            logout,
            getDecodedAccessToken,
            isAccessTokenExpired,
        }),

        // eslint-disable-next-line react-hooks/exhaustive-deps
        [user],
    );
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
