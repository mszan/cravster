import { Collection, Entity, Enum, Property, OneToMany } from "@mikro-orm/core";
import { ApiProperty } from "@nestjs/swagger";
import { UserRole } from "../interfaces/user-role";
import { BaseEntity } from "./base.entity";
import { IngredientEntity } from "./ingredient.entity";
import { PhotoEntity } from "./photo.entity";
import { RecipeEntity } from "./recipe.entity";

@Entity()
export class UserEntity extends BaseEntity {
  @ApiProperty({ maxLength: 255, nullable: false })
  @Property({ length: 255, nullable: false, unique: true })
  username!: string;

  @Property({ length: 255, nullable: false, hidden: true })
  password!: string;

  @ApiProperty({ enum: Object.values(UserRole), isArray: true, nullable: false })
  @Enum({ default: [UserRole.USER], nullable: false })
  roles = [UserRole.USER];

  @Property({ nullable: true, hidden: true })
  refreshToken: string | null;

  @OneToMany({ entity: () => IngredientEntity, mappedBy: ingredient => ingredient.user, orphanRemoval: true })
  ingredients = new Collection<IngredientEntity>(this);

  @OneToMany({ entity: () => PhotoEntity, mappedBy: photo => photo.user, orphanRemoval: true })
  photos = new Collection<PhotoEntity>(this);

  @OneToMany({ entity: () => RecipeEntity, mappedBy: recipe => recipe.user, orphanRemoval: true })
  recipes = new Collection<RecipeEntity>(this);
}
