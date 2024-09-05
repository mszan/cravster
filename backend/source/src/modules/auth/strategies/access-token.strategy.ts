import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy, StrategyOptions } from "passport-jwt";
import { IAccessTokenPayload } from "../../../schema/interfaces/jwt";
import { configInstance } from "../../app/app.config";

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: configInstance.auth.jwt.accessToken.ignoreExpiration,
      secretOrKey: configInstance.auth.jwt.accessToken.secret,
    } as StrategyOptions);
  }

  validate(payload: IAccessTokenPayload) {
    return { tokenPayload: payload };
  }
}
