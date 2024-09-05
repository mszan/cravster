import { Collection, Entity, Enum, Property, OneToMany } from "@mikro-orm/core";
import { ApiProperty } from "@nestjs/swagger";
import { UserRole } from "../interfaces/user-role";
import { Base } from "./base.entity";
import { Ingredient } from "./ingredient.entity";
import { Photo } from "./photo.entity";
import { Recipe } from "./recipe.entity";

@Entity()
export class User extends Base {
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

  @OneToMany({ entity: () => Ingredient, mappedBy: ingredient => ingredient.user, orphanRemoval: true })
  ingredients = new Collection<Ingredient>(this);

  @OneToMany({ entity: () => Photo, mappedBy: photo => photo.user, orphanRemoval: true })
  photos = new Collection<Photo>(this);

  @OneToMany({ entity: () => Recipe, mappedBy: recipe => recipe.user, orphanRemoval: true })
  recipes = new Collection<Recipe>(this);
}
