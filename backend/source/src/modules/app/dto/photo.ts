import { ApiProperty } from "@nestjs/swagger";

export class Photo {
  @ApiProperty({ nullable: false })
  path!: string;

  @ApiProperty({ nullable: false })
  filename!: string;
}
