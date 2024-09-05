import { Entity, ManyToOne, OneToOne, Property } from "@mikro-orm/core";
import { ApiProperty } from "@nestjs/swagger";
import { Base } from "./base.entity";
import { Photo } from "./photo.entity";
import { User } from "./user.entity";

@Entity()
export class Recipe extends Base {
  @ApiProperty({ maxLength: 255, nullable: false })
  @Property({ length: 255, nullable: false })
  title!: string;

  @ApiProperty({ nullable: true, maxLength: 10000 })
  @Property({ nullable: true, length: 10000 })
  description?: string;

  @ApiProperty({ type: () => Photo, isArray: false, nullable: true })
  @OneToOne({
    entity: () => Photo,
    mappedBy: (Photo: Photo) => Photo.recipe,
    nullable: true,
    orphanRemoval: true,
  })
  photo?: Photo;

  @ManyToOne({ entity: () => User, nullable: false })
  user!: User;
}
