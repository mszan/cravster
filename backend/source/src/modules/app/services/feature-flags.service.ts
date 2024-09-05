import { Injectable, Logger } from "@nestjs/common";

export enum FeatureFlagEnum {
  /**
   * Enables debug logging.
   *
   * **WARN:** This extremely increases the log size, thus should be used only for debugging purposes.
   */
  LOG_DEBUG = "log-debug",

  /**
   * Enables HTTP request logging.
   *
   * **NOTE:** This does not disable logging of HTTP requests, it just enables additional logging of incomming traffic.
   * **WARN:** This extremely increases the log size, thus should be used only for debugging purposes.
   */
  LOG_REQ = "log-req",
}
// placeholder for feature flags service
// todo: add unleash or smth similar
@Injectable()
export class FeatureFlagsService {
  protected readonly logger = new Logger(FeatureFlagsService.name);

  public isEnabled(featureFlagName: FeatureFlagEnum): boolean {
    featureFlagName;
    return true;
  }
}
