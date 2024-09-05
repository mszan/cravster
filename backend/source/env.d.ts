import { NodeEnv } from "./src/modules/app/app.config";

type BooleanString = "true" | "false";

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            DB_HOST: string;
            DB_NAME: string;
            DB_PASS: string;
            DB_PORT: string;
            DB_USER: string;
            NEST_DEBUG: BooleanString;
            NODE_ENV: NodeEnv.LOCAL | NodeEnv.PRODUCTION;
            NPM_CONFIG_LOGLEVEL: string;
            JWT_ACCESS_SECRET: string;
            JWT_REFRESH_SECRET: string;
            STORAGE_MANAGER_ENDPOINT: string;
            STORAGE_MANAGER_PORT: string;
            STORAGE_MANAGER_USE_SSL: string;
            STORAGE_MANAGER_USER: string;
            STORAGE_MANAGER_PASSWORD: string;
        }
    }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
