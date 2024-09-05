import { Injectable, Logger } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import * as jwt from "jsonwebtoken";
import { JwtExpiredException, JwtMalformedException } from "../../app/errors/errors";

@Injectable()
export class RefreshTokenGuard extends AuthGuard("jwt-refresh") {
  private readonly logger = new Logger(RefreshTokenGuard.name);

  // Custom token exception handlers.
  handleRequest(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    err: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    info: any,
    // _context: any,
    // _status: any
  ) {
    if (err) {
      this.logger.debug(err);
      throw err;
    }

    // Token expired.
    if (info instanceof jwt.TokenExpiredError) {
      this.logger.debug(info);
      throw new JwtExpiredException();
    }

    // Token malformed.
    if (info instanceof jwt.JsonWebTokenError) {
      this.logger.debug(info);
      throw new JwtMalformedException();
    }

    return user;
  }
}
