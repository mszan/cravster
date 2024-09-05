import { ApiProperty } from "@nestjs/swagger";

export class RefreshTokensResponse {
  @ApiProperty()
  readonly accessToken!: string;

  @ApiProperty()
  readonly refreshToken!: string;
}
