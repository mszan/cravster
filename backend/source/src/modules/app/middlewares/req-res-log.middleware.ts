import { Inject, Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { FeatureFlagEnum, FeatureFlagsService } from "../services/feature-flags.service";

type ReqLog = {
  type: "req";
  method: string;
  baseUrl: string;

  debugData?: {
    headers?: unknown;
    body?: unknown;
    query?: unknown;
    params?: unknown;
    ip?: unknown;
  };
};

type ResLog = {
  type: "res";
  baseUrl: string;
  method: string;
  path: string;
  statusCode: number;
  responseTime: number;
  debugData?: {
    resBodyOk?: unknown;
    resBodyError?: unknown;
    headers?: unknown;
    ip?: unknown;
  };
};

export const RESPONSE_ERROR_SYMBOL = Symbol("RESPONSE_ERROR");

/**
 * HTTP requests logger.
 *
 * NestJS does not log HTTP requests by default, thus this middleware.
 * This should be (probably) implemented as LoggerService.
 * Please refer to NestJS Logger documentation.
 * https://docs.nestjs.com/techniques/logger
 */
@Injectable()
export class ReqResLogMiddleware implements NestMiddleware {
  private logger = new Logger(ReqResLogMiddleware.name);
  @Inject() private readonly featureFlagsService: FeatureFlagsService;

  use(req: Request, res: Response, next: NextFunction): void {
    const reqAt = Date.now();
    const { method, baseUrl } = req;

    if (this.featureFlagsService.isEnabled(FeatureFlagEnum.LOG_REQ)) {
      const reqLog: ReqLog = {
        type: "req",
        method,
        baseUrl,
      };

      if (this.featureFlagsService.isEnabled(FeatureFlagEnum.LOG_DEBUG)) {
        reqLog.debugData = {
          headers: req.headers,
          body: req.body,
          query: req.query,
          params: req.params,
          ip: req.ip,
        };
      }

      this.logger.log(reqLog);
    }

    res.on("close", () => {
      const resLog: ResLog = {
        type: "res",
        baseUrl,
        method,
        path: res?.req?.route?.path || req.path,
        statusCode: res.statusCode,
        responseTime: Date.now() - reqAt,
      };

      if (this.featureFlagsService.isEnabled(FeatureFlagEnum.LOG_DEBUG)) {
        resLog.debugData = {
          resBodyError: (res as never)[RESPONSE_ERROR_SYMBOL],
          headers: res.getHeaders(),
          ip: req.ip,
          // resBodyOk: res.body, // todo: find a way to log response body on success
        };
      }

      this.logger.log(resLog);
    });

    next();
    return;
  }
}
