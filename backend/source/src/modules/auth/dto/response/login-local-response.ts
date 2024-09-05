import { ApiProperty } from "@nestjs/swagger";

export class LoginLocalResponse {
  @ApiProperty()
  readonly accessToken!: string;

  @ApiProperty()
  readonly refreshToken!: string;
}
