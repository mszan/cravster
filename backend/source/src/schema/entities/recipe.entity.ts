import { Collection, Entity, OneToMany, OneToOne, Property, ManyToOne } from "@mikro-orm/core";
import { ApiProperty } from "@nestjs/swagger";
import { BaseEntity } from "./base.entity";
import { PhotoEntity } from "./photo.entity";
import { UserEntity } from "./user.entity";
import { RecipeIngredientEntity } from "./recipe-ingredient.entity";

@Entity()
export class RecipeEntity extends BaseEntity {
  @ApiProperty({ maxLength: 255, nullable: false })
  @Property({ length: 255, nullable: false })
  title!: string;

  @ApiProperty({ nullable: true, maxLength: 10000 })
  @Property({ nullable: true, length: 10000 })
  description: string | null;

  @ApiProperty({ nullable: false, type: () => RecipeIngredientEntity, isArray: true })
  @OneToMany({
    entity: () => RecipeIngredientEntity,
    mappedBy: "recipe",
    orphanRemoval: true,
  })
  recipeIngredients = new Collection<RecipeIngredientEntity>(this);

  @ApiProperty({ type: () => PhotoEntity, isArray: false, nullable: true })
  @OneToOne({
    entity: () => PhotoEntity,
    mappedBy: (Photo: PhotoEntity) => Photo.recipe,
    nullable: true,
    orphanRemoval: true,
  })
  photo?: PhotoEntity;

  @ApiProperty({ nullable: false, type: () => UserEntity })
  @ManyToOne({ entity: () => UserEntity, nullable: false })
  user!: UserEntity;
}
