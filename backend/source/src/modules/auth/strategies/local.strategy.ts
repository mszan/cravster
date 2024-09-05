import { Inject, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthService } from "../auth.service";

// Strategy for Basic auth (username and password).
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(LocalStrategy.name);

  @Inject()
  authService: AuthService;

  async validate(username: string, password: string) {
    return await this.authService.validateUserPassword(username, password).catch(e => {
      this.logger.error(e);
      throw new UnauthorizedException();
    });
  }
}
