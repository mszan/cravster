import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AccessTokenStrategy } from "./strategies/access-token.strategy";
import { LocalStrategy } from "./strategies/local.strategy";
import { RefreshTokenStrategy } from "./strategies/refresh-token.strategy";

/**
 * This module handles authentication and authorization all over the NestJS app.
 */
@Module({
  imports: [PassportModule, JwtModule.register({})],
  providers: [AuthService, LocalStrategy, AccessTokenStrategy, RefreshTokenStrategy],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
