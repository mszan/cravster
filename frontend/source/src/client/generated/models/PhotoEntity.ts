/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { RecipeEntity } from './RecipeEntity';

export type PhotoEntity = {
    id: string;
    createdAt: string;
    updatedAt: string;
    path: string;
    filename: string;
    recipe: RecipeEntity | null;
};

