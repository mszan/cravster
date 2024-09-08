/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AddRecipeInput } from '../models/AddRecipeInput';
import type { DeleteByUuidInput } from '../models/DeleteByUuidInput';
import type { EditRecipeInput } from '../models/EditRecipeInput';
import type { PaginatedRecipeInList } from '../models/PaginatedRecipeInList';
import type { RecipeEntity } from '../models/RecipeEntity';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class RecipeService {

    /**
     * Get recipe list
     * @param offset
     * @param limit
     * @returns PaginatedRecipeInList
     * @throws ApiError
     */
    public static recipeControllerRecipeList(
        offset?: number,
        limit?: number,
    ): CancelablePromise<PaginatedRecipeInList> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/recipe',
            query: {
                'offset': offset,
                'limit': limit,
            },
        });
    }

    /**
     * Add recipe
     * @param requestBody
     * @returns RecipeEntity
     * @throws ApiError
     */
    public static recipeControllerRecipeAdd(
        requestBody: AddRecipeInput,
    ): CancelablePromise<RecipeEntity> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/recipe',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Edit recipe
     * @param formData
     * @returns void
     * @throws ApiError
     */
    public static recipeControllerRecipeEdit(
        formData: EditRecipeInput,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/v1/recipe',
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }

    /**
     * Delete recipe
     * @param requestBody
     * @returns RecipeEntity
     * @throws ApiError
     */
    public static recipeControllerRecipeRemove(
        requestBody: DeleteByUuidInput,
    ): CancelablePromise<RecipeEntity> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/recipe',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Get recipe details
     * @param id
     * @returns RecipeEntity
     * @throws ApiError
     */
    public static recipeControllerRecipeDetails(
        id: string,
    ): CancelablePromise<RecipeEntity> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/recipe/{id}',
            path: {
                'id': id,
            },
        });
    }

}
