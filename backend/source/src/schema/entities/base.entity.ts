import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { ApiProperty } from "@nestjs/swagger";

export interface BaseInterface {
  id: string;
}

@Entity({ abstract: true })
export abstract class Base implements BaseInterface {
  @ApiProperty({
    nullable: false,
  })
  @PrimaryKey({ type: "uuid", defaultRaw: "uuid_generate_v4()" })
  id!: string;

  @ApiProperty({
    nullable: false,
  })
  @Property({
    columnType: "timestamp(0)",
    defaultRaw: "CURRENT_TIMESTAMP",
    nullable: false,
  })
  createdAt: Date = new Date();

  @ApiProperty({
    nullable: false,
  })
  @Property({
    columnType: "timestamp(0)",
    onUpdate: () => new Date(),
  })
  updatedAt: Date = new Date();
}
