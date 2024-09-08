/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PageInfo } from './PageInfo';
import type { RecipeInList } from './RecipeInList';

export type PaginatedRecipeInList = {
    /**
     * Total count of returned records.
     */
    totalCount: number;
    pageInfo: PageInfo;
    result: Array<RecipeInList>;
};

