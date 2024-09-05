import { Entity, ManyToOne, OneToOne, Property } from "@mikro-orm/core";
import { ApiProperty } from "@nestjs/swagger";
import { Base } from "./base.entity";
import { Recipe } from "./recipe.entity";
import { User } from "./user.entity";

@Entity()
export class Photo extends Base {
  @ManyToOne({ entity: () => User, nullable: false })
  user!: User;

  @ApiProperty({ nullable: false })
  @Property({ nullable: false })
  path!: string;

  @ApiProperty({ nullable: false })
  @Property({ nullable: false })
  filename!: string;

  @ApiProperty({ type: () => Recipe, nullable: true })
  @OneToOne(() => Recipe, recipe => recipe.photo, { owner: true, nullable: true })
  recipe?: Recipe;
}
