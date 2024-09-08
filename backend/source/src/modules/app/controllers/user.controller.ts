import { MikroORM } from "@mikro-orm/core";
import { Body, Controller, Get, HttpStatus, Inject, NotFoundException, Patch } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import * as bcrypt from "bcrypt";
import { UserEntity } from "../../../schema/entities/user.entity";
import { IUser } from "../../../schema/interfaces/jwt";
import { UserRole } from "../../../schema/interfaces/user-role";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { ORM } from "../../orm/orm.module";
import { UpdateUserInput } from "../dto/user/update-user.input";
import { Roles } from "../decorators/roles.decorator";
import { ApplyApiInternalServiceExceptionResponse } from "../decorators/apply-api-internal-service-exception-response.decorator";

@ApplyApiInternalServiceExceptionResponse()
@ApiTags("user")
@Controller("user")
export class UserController {
  @Inject(ORM)
  private readonly orm: MikroORM;

  @Roles([UserRole.USER])
  @ApiOperation({
    summary: "Get user details",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: UserEntity,
  })
  @Get("details")
  async userDetails(@CurrentUser() user: IUser): Promise<UserEntity> {
    const userEntity = await this.orm.em.findOne(UserEntity, { id: user.id });
    if (!userEntity) {
      throw new NotFoundException();
    }

    return userEntity;
  }

  @Roles([UserRole.USER])
  @ApiOperation({
    summary: "Update user",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: UserEntity,
  })
  @Patch("update")
  async userUpdate(@CurrentUser() user: IUser, @Body() input: UpdateUserInput): Promise<UserEntity> {
    const userEntity = await this.orm.em.findOne(UserEntity, { id: user.id });
    if (!userEntity) {
      throw new NotFoundException();
    }

    if (input.password) {
      userEntity.password = bcrypt.hashSync(input.password, 10);
    }

    await this.orm.em.persistAndFlush(userEntity);
    return userEntity;
  }
}
