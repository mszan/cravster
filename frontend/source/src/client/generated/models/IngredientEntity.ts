/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { IngredientCategory } from './IngredientCategory';
import type { IngredientUnit } from './IngredientUnit';
import type { RecipeIngredientEntity } from './RecipeIngredientEntity';
import type { UserEntity } from './UserEntity';

export type IngredientEntity = {
    id: string;
    createdAt: string;
    updatedAt: string;
    user: UserEntity;
    recipeIngredients: Array<RecipeIngredientEntity>;
    name: string;
    category: IngredientCategory;
    unit: IngredientUnit;
    storageAmount: number;
    shoppingAmount: number;
};

