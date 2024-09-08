import { Entity, ManyToOne, OneToOne, Property } from "@mikro-orm/core";
import { ApiProperty } from "@nestjs/swagger";
import { BaseEntity } from "./base.entity";
import { RecipeEntity } from "./recipe.entity";
import { UserEntity } from "./user.entity";

@Entity()
export class PhotoEntity extends BaseEntity {
  @ManyToOne({ entity: () => UserEntity, nullable: false })
  user!: UserEntity;

  @ApiProperty({ nullable: false })
  @Property({ nullable: false })
  path!: string;

  @ApiProperty({ nullable: false })
  @Property({ nullable: false })
  filename!: string;

  @ApiProperty({ type: () => RecipeEntity, nullable: true })
  @OneToOne(() => RecipeEntity, recipe => recipe.photo, { owner: true, nullable: true })
  recipe?: RecipeEntity;
}
