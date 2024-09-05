import { BadRequestException, Logger, PipeTransform, ValidationPipe } from "@nestjs/common";
import { GlobalPrefixOptions, RouteInfo } from "@nestjs/common/interfaces";
import { CorsOptions, CorsOptionsDelegate } from "@nestjs/common/interfaces/external/cors-options.interface";
import { SwaggerCustomOptions, SwaggerDocumentOptions } from "@nestjs/swagger";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import _ from "lodash";
import LRUCache from "lru-cache";
import { Region } from "minio";
import { allExceptions } from "./errors/errors";

export enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
  HEAD = "HEAD",
  OPTIONS = "OPTIONS",
  TRACE = "TRACE",
}

export enum NodeEnv {
  LOCAL = "local",
  PRODUCTION = "production",
}

export type BucketKey = "photos";
export type BucketName = "photos-dev" | "photos";

export type Configs = {
  [key in NodeEnv]: Config;
};

export type Config = {
  app: {
    /**
     * Object that contains args passed to ``app`` instance during bootstrapping.
     * E2E tests require the very same args, thus the extracted object.
     */
    args: {
      setGlobalPrefix: [prefix: string, options?: GlobalPrefixOptions<string | RouteInfo>];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      useGlobalPipes: [...pipes: PipeTransform<any, any>[]];
      /**
       * Must be called right after ``app.create()``.
       */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      useHelmet: [...args: any[]];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      useCookieParser: [...args: any[]];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      useBodyParser: [...args: any[]];
    };
    port: number;
    environment: NodeEnv;
    version: string; // todo: determinate versioning
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cors: CorsOptions | CorsOptionsDelegate<any>;
    swagger: {
      isEnabled: boolean;
      url: string;
      title: string;
      description: string;
      contact: {
        name: string;
        url: string;
        email: string;
      };
      customOptions: SwaggerCustomOptions;
      documentOptions: SwaggerDocumentOptions;
    };
  };
  auth: {
    jwt: {
      accessToken: {
        secret: string;
        /**
         * In seconds or a string describing a time span zeit/ms. Eg: 60, "2 days", "10h", "7d".
         */
        expirationTime: string;
        /**
         * Whether access token should expire or not. Useful in development.
         */
        ignoreExpiration: boolean;
      };
      refreshToken: {
        secret: string;
        /**
         * In seconds or a string describing a time span zeit/ms. Eg: 60, "2 days", "10h", "7d".
         */
        expirationTime: string;
      };
    };
  };
  cache: {
    inMemory: {
      defaultOptions: LRUCache.Options<string, unknown>;
      defaultGetOptions: LRUCache.GetOptions;
      defaultSetOptions: LRUCache.SetOptions<string, unknown>;
    };
  };
  database: {
    host: string;
    port: string;
    database: string;
    user: string;
    password: string;
  };
  storage: {
    publicUrl: string;
    buckets: {
      [x in BucketKey]: {
        name: BucketName;
        region: Region;
        policy: string;
      };
    };
    endPoint: string;
    port: number;
    useSSL: boolean;
    accessKey: string;
    secretKey: string;
  };
  urls: {
    frontend: string;
  };
};

/**
 * All defined app configs.
 */
export const configs: Configs = {
  local: {
    app: {
      args: {
        setGlobalPrefix: ["v1", { exclude: ["healthcheck"] }],
        useGlobalPipes: [
          new ValidationPipe({
            disableErrorMessages: false,
            enableDebugMessages: true,
            exceptionFactory: (errors: unknown) => {
              const logger = new Logger("Validation exception factory");
              logger.debug("Validation error", errors);
              return new BadRequestException(errors);
            },
            validationError: {
              value: true,
              target: true,
            },
            transform: true,
          }),
        ],
        useCookieParser: [cookieParser()],
        useHelmet: [helmet()],
        useBodyParser: [bodyParser.json({ limit: "50mb" }), bodyParser.urlencoded({ limit: "50mb" })],
      },
      cors: {
        origin: "*", // todo: remove asterix
      },
      environment: process.env.NODE_ENV as NodeEnv,
      port: 3000,
      swagger: {
        isEnabled: true,
        contact: {
          email: "dmszanowski@icloud.com",
          name: "Dawid Mszanowski",
          url: "https://github.com/mszan",
        },
        description: "",
        title: "cravster",
        url: "docs",
        customOptions: {
          swaggerOptions: {
            persistAuthorization: true,
            tagsSorter: "alpha",
            operationsSorter: "alpha",
          },
          customSiteTitle: "cravster - docs",
          customCss: ".swagger-ui .topbar { display: none }",
        },
        documentOptions: {
          deepScanRoutes: true,
          extraModels: [...allExceptions],
        },
      },
      version: "local",
    },
    auth: {
      jwt: {
        accessToken: {
          secret: process.env.JWT_ACCESS_SECRET,
          expirationTime: "20s",
          ignoreExpiration: true,
        },
        refreshToken: {
          expirationTime: "7d",
          secret: process.env.JWT_REFRESH_SECRET,
        },
      },
    },
    cache: {
      inMemory: {
        defaultOptions: {
          ttl: 1 * 60 * 1000, // ms
          max: 500,
        },
        defaultGetOptions: {},
        defaultSetOptions: {},
      },
    },
    database: {
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      password: process.env.DB_PASS,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
    },
    storage: {
      publicUrl: "https://storage-cravster.mszanowski.pl/photos-dev",
      buckets: {
        photos: {
          name: "photos-dev",
          region: "us-east-1",
          policy: JSON.stringify({
            Statement: [
              {
                Action: ["s3:ListBucket", "s3:GetBucketLocation"],
                Effect: "Deny",
                Principal: {
                  AWS: ["*"],
                },
                Resource: ["arn:aws:s3:::photos-dev"],
              },
              {
                Action: ["s3:GetObject"],
                Effect: "Allow",
                Principal: {
                  AWS: ["*"],
                },
                Resource: ["arn:aws:s3:::photos-dev/*"],
              },
            ],
            Version: "2012-10-17",
          }),
        },
      },
      endPoint: process.env.STORAGE_MANAGER_ENDPOINT,
      port: _.parseInt(process.env.STORAGE_MANAGER_PORT),
      useSSL: process.env.STORAGE_MANAGER_USE_SSL == "true",
      accessKey: process.env.STORAGE_MANAGER_USER,
      secretKey: process.env.STORAGE_MANAGER_PASSWORD,
    },
    urls: {
      frontend: "https://cravster.local.com",
    },
  },
  production: {
    app: {
      args: {
        setGlobalPrefix: ["v1", { exclude: ["healthcheck"] }],
        useGlobalPipes: [
          new ValidationPipe({
            disableErrorMessages: false,
            enableDebugMessages: true,
            exceptionFactory: (errors: unknown) => {
              const logger = new Logger("Validation exception factory");
              logger.debug("Validation error", errors);
              return new BadRequestException(errors);
            },
            validationError: {
              value: true,
              target: true,
            },
            transform: true,
          }),
        ],
        useCookieParser: [cookieParser()],
        useHelmet: [helmet()],
        useBodyParser: [bodyParser.json({ limit: "50mb" }), bodyParser.urlencoded({ limit: "50mb" })],
      },
      cors: {
        origin: "*",
      },
      environment: process.env.NODE_ENV as NodeEnv,
      port: 3000,
      swagger: {
        isEnabled: true,
        contact: {
          email: "dmszanowski@icloud.com",
          name: "Dawid Mszanowski",
          url: "https://github.com/mszan",
        },
        description: "",
        title: "cravster",
        url: "docs",
        customOptions: {
          swaggerOptions: {
            persistAuthorization: true,
            tagsSorter: "alpha",
            operationsSorter: "alpha",
          },
          customSiteTitle: "cravster - docs",
          customCss: ".swagger-ui .topbar { display: none }",
        },
        documentOptions: {
          deepScanRoutes: true,
          extraModels: [...allExceptions],
        },
      },
      version: "local",
    },
    auth: {
      jwt: {
        accessToken: {
          secret: process.env.JWT_ACCESS_SECRET,
          expirationTime: "20s",
          ignoreExpiration: true,
        },
        refreshToken: {
          expirationTime: "7d",
          secret: process.env.JWT_REFRESH_SECRET,
        },
      },
    },
    cache: {
      inMemory: {
        defaultOptions: {
          ttl: 1 * 60 * 1000, // ms
          max: 500,
        },
        defaultGetOptions: {},
        defaultSetOptions: {},
      },
    },
    database: {
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      password: process.env.DB_PASS,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
    },
    storage: {
      buckets: {
        photos: {
          name: "photos",
          region: "us-east-1",
          policy: JSON.stringify({
            Statement: [
              {
                Action: ["s3:ListBucket", "s3:GetBucketLocation"],
                Effect: "Deny",
                Principal: {
                  AWS: ["*"],
                },
                Resource: ["arn:aws:s3:::photos"],
              },
              {
                Action: ["s3:GetObject"],
                Effect: "Allow",
                Principal: {
                  AWS: ["*"],
                },
                Resource: ["arn:aws:s3:::photos/*"],
              },
            ],
            Version: "2012-10-17",
          }),
        },
      },
      publicUrl: "https://storage.cravster.eu/photos",
      endPoint: process.env.STORAGE_MANAGER_ENDPOINT,
      port: _.parseInt(process.env.STORAGE_MANAGER_PORT),
      useSSL: process.env.STORAGE_MANAGER_USE_SSL == "true",
      accessKey: process.env.STORAGE_MANAGER_USER,
      secretKey: process.env.STORAGE_MANAGER_PASSWORD,
    },
    urls: {
      frontend: "https://cravster.eu",
    },
  },
};

/**
 * One specific app config this app uses that was determinated by ``process.env.NODE_ENV``.
 */
export let configFactory: () => Config;

switch (process.env.NODE_ENV) {
  case NodeEnv.LOCAL:
    configFactory = () => configs.local;
    break;
  case NodeEnv.PRODUCTION:
    configFactory = () => configs.production;
    break;
  default:
    throw new Error("Could not load application config. See app.config.ts for details.");
}

/**
 * Initialized config.
 */
export const configInstance = configFactory();
