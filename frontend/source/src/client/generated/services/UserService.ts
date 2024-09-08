/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UpdateUserInput } from '../models/UpdateUserInput';
import type { UserEntity } from '../models/UserEntity';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class UserService {

    /**
     * Get user details
     * @returns UserEntity
     * @throws ApiError
     */
    public static userControllerUserDetails(): CancelablePromise<UserEntity> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/user/details',
        });
    }

    /**
     * Update user
     * @param requestBody
     * @returns UserEntity
     * @throws ApiError
     */
    public static userControllerUserUpdate(
        requestBody: UpdateUserInput,
    ): CancelablePromise<UserEntity> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/v1/user/update',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
