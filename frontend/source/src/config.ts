import store from "store";
import { OpenAPI } from "./client/generated";

export enum NodeEnv {
    LOCAL = "local",
    PRODUCTION = "production",
}

export type Configs = {
    [key in NodeEnv]: Config;
};

export type Config = {
    app: {};
    urls: {
        frontend: string;
        backend: string;
        storage: string;
    };
};

/**
 * All defined app configs.
 */
export const configs: Configs = {
    local: {
        app: {},
        urls: {
            frontend: "http://local.com:7003",
            backend: "http://local.com:6001",
            storage: "http://local.com:6006/photos-dev",
        },
    },
    production: {
        app: {},
        urls: {
            frontend: "https://cravster.eu",
            backend: "https://api.cravster.eu",
            storage: "https://storage.cravster.eu/photos",
        },
    },
};

/**
 * One specific app config this app uses that was determinated by ``process.env.NODE_ENV``.
 */
export let configFactory: () => Config;

OpenAPI.TOKEN = store.get("user")?.accessToken;

switch (process.env.REACT_APP_HOST_ENV) {
    case NodeEnv.LOCAL:
        OpenAPI.BASE = configs.local.urls.backend;
        configFactory = () => configs.local;
        break;
    case NodeEnv.PRODUCTION:
        OpenAPI.BASE = configs.production.urls.backend;
        configFactory = () => configs.production;
        break;
    default:
        throw new Error("Could not load application config. See app.config.ts for details.");
}

/**
 * Initialized config.
 */
export const configInstance = configFactory();
