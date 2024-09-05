/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type AddIngredientInput = {
    name: string;
    category: AddIngredientInput.category;
    unit: AddIngredientInput.unit;
    storageAmount: number;
    shoppingAmount: number;
};

export namespace AddIngredientInput {

    export enum category {
        ALCOHOL = 'ALCOHOL',
        DRY_GOODS = 'DRY_GOODS',
        CHEMICALS = 'CHEMICALS',
        CAKES_DESSERTS_ADDONS = 'CAKES_DESSERTS_ADDONS',
        READY_MEALS = 'READY_MEALS',
        COFFEE = 'COFFEE',
        MEAT_DELI = 'MEAT_DELI',
        FROZEN_FOODS_ICE_CREAM = 'FROZEN_FOODS_ICE_CREAM',
        DAIRY = 'DAIRY',
        BREAD = 'BREAD',
        FISH = 'FISH',
        SWEETS = 'SWEETS',
        FATS = 'FATS',
        FRUITS_VEGETABLES = 'FRUITS_VEGETABLES',
        OTHER = 'OTHER',
    }

    export enum unit {
        GRAM = 'GRAM',
        KILOGRAM = 'KILOGRAM',
        LITER = 'LITER',
        MILLILITER = 'MILLILITER',
        PIECE = 'PIECE',
    }


}

