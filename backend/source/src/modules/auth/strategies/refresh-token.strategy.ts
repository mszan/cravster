import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy, StrategyOptions } from "passport-jwt";
import { IRefreshTokenPayload, IRefreshTokenStrategyUserObject } from "../../../schema/interfaces/jwt";
import { configInstance } from "../../app/app.config";

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, "jwt-refresh") {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configInstance.auth.jwt.refreshToken.secret,
      passReqToCallback: true,
    } as StrategyOptions);
  }

  validate(_req: Request, payload: IRefreshTokenPayload): IRefreshTokenStrategyUserObject {
    return {
      tokenPayload: payload,
    };
  }
}
