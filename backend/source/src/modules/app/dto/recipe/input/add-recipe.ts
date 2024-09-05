import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class AddRecipeInput {
  @ApiProperty({ maxLength: 255, required: true })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title!: string;
}
