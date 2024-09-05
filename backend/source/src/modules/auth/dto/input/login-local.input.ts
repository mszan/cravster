import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class LoginLocalInput {
  @ApiProperty({ example: "imAdmin" })
  @IsNotEmpty()
  @IsString()
  readonly username: string;

  @ApiProperty({ example: "Test@1234" })
  @IsNotEmpty()
  @IsString()
  readonly password: string;
}
