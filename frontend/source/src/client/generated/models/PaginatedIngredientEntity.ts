/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { IngredientEntity } from './IngredientEntity';
import type { PageInfo } from './PageInfo';

export type PaginatedIngredientEntity = {
    /**
     * Total count of returned records.
     */
    totalCount: number;
    pageInfo: PageInfo;
    result: Array<IngredientEntity>;
};

