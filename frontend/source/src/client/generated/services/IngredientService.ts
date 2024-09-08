/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AddIngredientInput } from '../models/AddIngredientInput';
import type { DeleteByUuidInput } from '../models/DeleteByUuidInput';
import type { EditIngredientInput } from '../models/EditIngredientInput';
import type { IngredientEntity } from '../models/IngredientEntity';
import type { PaginatedIngredientEntity } from '../models/PaginatedIngredientEntity';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class IngredientService {

    /**
     * Get ingredient list
     * @param offset
     * @param limit
     * @returns PaginatedIngredientEntity
     * @throws ApiError
     */
    public static ingredientControllerIngredientList(
        offset?: number,
        limit?: number,
    ): CancelablePromise<PaginatedIngredientEntity> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/ingredient',
            query: {
                'offset': offset,
                'limit': limit,
            },
        });
    }

    /**
     * Add ingredient
     * @param requestBody
     * @returns IngredientEntity
     * @throws ApiError
     */
    public static ingredientControllerIngredientAdd(
        requestBody: AddIngredientInput,
    ): CancelablePromise<IngredientEntity> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/ingredient',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Edit ingredient
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static ingredientControllerIngredientEdit(
        requestBody: EditIngredientInput,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/v1/ingredient',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Delete ingredient
     * @param requestBody
     * @returns IngredientEntity
     * @throws ApiError
     */
    public static ingredientControllerIngredientRemove(
        requestBody: DeleteByUuidInput,
    ): CancelablePromise<IngredientEntity> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/ingredient',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Get ingredient details
     * @param id
     * @returns IngredientEntity
     * @throws ApiError
     */
    public static ingredientControllerIngredientDetails(
        id: string,
    ): CancelablePromise<IngredientEntity> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/ingredient/{id}',
            path: {
                'id': id,
            },
        });
    }

}
