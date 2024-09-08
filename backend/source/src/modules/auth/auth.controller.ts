import { MikroORM } from "@mikro-orm/core";
import { Controller, ForbiddenException, Inject, Post, Request, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { UserEntity } from "../../schema/entities/user.entity";
import { IRefreshTokenStrategyUserObject, IUser } from "../../schema/interfaces/jwt";
import { ORM } from "../orm/orm.module";
import { AuthService } from "./auth.service";
import { CurrentBearer } from "./decorators/current-bearer.decorator";
import { CurrentRefreshTokenStrategyUserObject } from "./decorators/current-refresh-token-strategy-user-object.decorator";
import { LoginLocalInput } from "./dto/input/login-local.input";
import { LoginLocalResponse } from "./dto/response/login-local-response";
import { RefreshTokensResponse } from "./dto/response/refresh-tokens-response";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { RefreshTokenGuard } from "./guards/refresh-token.guard";
import { ApplyApiInternalServiceExceptionResponse } from "../app/decorators/apply-api-internal-service-exception-response.decorator";

@ApplyApiInternalServiceExceptionResponse()
@ApiTags("auth")
@Controller("auth")
export class AuthController {
  @Inject() private readonly authService: AuthService;
  @Inject(ORM) private readonly orm: MikroORM;

  @ApiOperation({ summary: "Login user" })
  @ApiBody({ required: true, type: LoginLocalInput })
  @ApiForbiddenResponse({ type: ForbiddenException })
  @ApiOkResponse({ type: LoginLocalResponse })
  @UseGuards(LocalAuthGuard)
  @Post("login")
  async login(@Request() req: Request & { user?: IUser }): Promise<LoginLocalResponse> {
    // password validation is done in LocalStrategy so at this point we are sure user password is correct
    const userEntity = await this.orm.em.findOne(UserEntity, { username: req.user?.username }); // todo: rm "?"

    if (!userEntity) {
      throw new ForbiddenException();
    }

    const tokens = await this.authService.getTokens(userEntity);
    await this.authService.updateRefreshTokenInDb(userEntity.id, tokens.refreshToken);
    return tokens;
  }

  @ApiOperation({ summary: "Refresh tokens" })
  @ApiForbiddenResponse({ type: ForbiddenException })
  @ApiOkResponse({ type: RefreshTokensResponse })
  @UseGuards(RefreshTokenGuard)
  @ApiBearerAuth()
  @Post("refreshTokens")
  async refreshTokens(
    @CurrentRefreshTokenStrategyUserObject() userObject: IRefreshTokenStrategyUserObject,
    @CurrentBearer() refreshToken: string,
  ): Promise<RefreshTokensResponse> {
    return await this.authService.refreshTokens(userObject.tokenPayload.user.id, refreshToken);
  }
}
