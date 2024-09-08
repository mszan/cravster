import { ApiProperty } from "@nestjs/swagger";
import { Photo } from "../photo";

export class RecipeInList {
  @ApiProperty({ nullable: false, type: () => String })
  id: string;

  @ApiProperty({ nullable: false, type: () => String, maxLength: 255 })
  title: string;

  @ApiProperty({ nullable: true, type: () => String, maxLength: 10000 })
  description: string | null;

  @ApiProperty({ nullable: true, type: () => Photo })
  photo: Photo | null;

  @ApiProperty({
    nullable: false,
    type: "array",
    items: {
      type: "object",
      required: ["isInStorage", "amount", "unit", "name"],
      properties: {
        isInStorage: { type: "boolean" },
        amount: { type: "number" },
        unit: { type: "string" },
        name: { type: "string" },
      },
    },
  })
  ingredients: { isInStorage: boolean; amount: number; unit: string; name: string }[];
}
