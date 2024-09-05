import { MikroORM } from "@mikro-orm/core";
import { ForbiddenException, Inject, Injectable, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcrypt";
import { User } from "../../schema/entities/user.entity";
import { IAccessTokenPayload, IRefreshTokenPayload } from "../../schema/interfaces/jwt";
import { configInstance } from "../app/app.config";
import { ORM } from "../orm/orm.module";

@Injectable()
export class AuthService {
  protected readonly logger = new Logger(AuthService.name);

  @Inject(ORM) private readonly orm: MikroORM;
  @Inject() private readonly jwtService: JwtService;

  public async validateUserPassword(
    username: string,
    password: string,
  ): Promise<Pick<User, "username" | "roles"> | null> {
    const user = await this.orm.em.findOneOrFail(User, { username });

    // Check if user password is correct.
    if (await bcrypt.compare(password, user.password)) {
      // Create JWT payload object.
      const payloadUser: Pick<User, "username" | "roles"> = {
        username: user.username,
        roles: user.roles,
      };
      return payloadUser;
    }
    return null;
  }

  async getTokens(user: User) {
    return {
      accessToken: await this.jwtService.signAsync(
        {
          user: {
            username: user.username,
            id: user.id,
          },
          roles: user.roles,
        } as IAccessTokenPayload,
        {
          secret: configInstance.auth.jwt.accessToken.secret,
          expiresIn: configInstance.auth.jwt.accessToken.expirationTime,
        },
      ),
      refreshToken: await this.jwtService.signAsync(
        {
          user: {
            username: user.username,
            id: user.id,
          },
        } as IRefreshTokenPayload,
        {
          secret: configInstance.auth.jwt.refreshToken.secret,
          expiresIn: configInstance.auth.jwt.refreshToken.expirationTime,
        },
      ),
    };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const userEntity = await this.orm.em.findOne(User, { id: userId });

    if (!userEntity) {
      this.logger.debug("User not found in the database.");
      throw new ForbiddenException();
    }
    if (!userEntity.refreshToken) {
      this.logger.debug("Refresh token not present in the database.");
      throw new ForbiddenException();
    }
    if (await bcrypt.compare(userEntity.refreshToken, refreshToken)) {
      this.logger.debug("Provided refresh token does not match with the one stored in a database.");
      throw new ForbiddenException();
    }
    const tokens = await this.getTokens(userEntity);
    await this.updateRefreshTokenInDb(userEntity.id, tokens.refreshToken);
    return tokens;
  }

  public async updateRefreshTokenInDb(userId: string, refreshToken: string | null): Promise<void> {
    let hashedRefreshToken = null;
    if (refreshToken) {
      hashedRefreshToken = bcrypt.hashSync(refreshToken, 10);
    }

    const userEntity = await this.orm.em.findOneOrFail(User, { id: userId });
    userEntity.refreshToken = hashedRefreshToken;
    await this.orm.em.persistAndFlush(userEntity);
  }
}
