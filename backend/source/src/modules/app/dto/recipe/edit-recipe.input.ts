import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class EditRecipeInput {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  id!: string;

  @ApiProperty({ required: false, maxLength: 10000 })
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  description?: string;

  @ApiProperty({ maxLength: 255, required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  /**
   * ! DON'T USE THIS PROPERTY IN THE CONTROLLER. This is added only for Swagger purposes. See NestJS File Upload Docs for ref.
   */
  @ApiProperty({ type: "string", format: "binary", required: false })
  readonly photo?: Express.Multer.File;
}
