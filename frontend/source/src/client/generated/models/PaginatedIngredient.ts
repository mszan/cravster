/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Ingredient } from './Ingredient';
import type { PageInfo } from './PageInfo';

export type PaginatedIngredient = {
    /**
     * Total count of returned records.
     */
    totalCount: number;
    pageInfo: PageInfo;
    result: Array<Ingredient>;
};

