import { ApiProperty } from "@nestjs/swagger";

export class AddRecipePhotoInput {
  /**
   * ! DON'T USE THIS PROPERTY IN THE CONTROLLER. This is added only for Swagger purposes. See NestJS File Upload Docs for ref.
   */
  @ApiProperty({ type: "string", format: "binary", required: false })
  readonly photo?: Express.Multer.File;
}
