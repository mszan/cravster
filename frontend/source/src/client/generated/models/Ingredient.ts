/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { IngredientCategory } from './IngredientCategory';
import type { IngredientUnit } from './IngredientUnit';

export type Ingredient = {
    id: string;
    createdAt: string;
    updatedAt: string;
    name: string;
    category: IngredientCategory;
    unit: IngredientUnit;
    storageAmount: number;
    shoppingAmount: number;
};

