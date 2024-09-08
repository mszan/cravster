/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PhotoEntity } from './PhotoEntity';
import type { RecipeIngredientEntity } from './RecipeIngredientEntity';
import type { UserEntity } from './UserEntity';

export type RecipeEntity = {
    id: string;
    createdAt: string;
    updatedAt: string;
    title: string;
    description: Record<string, any> | null;
    recipeIngredients: Array<RecipeIngredientEntity>;
    photo: PhotoEntity | null;
    user: UserEntity;
};

