/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UpdateUserInput } from '../models/UpdateUserInput';
import type { User } from '../models/User';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class UserService {

    /**
     * Get user details
     * @returns User
     * @throws ApiError
     */
    public static userControllerUserDetails(): CancelablePromise<User> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/user/details',
        });
    }

    /**
     * Update user
     * @param requestBody
     * @returns User
     * @throws ApiError
     */
    public static userControllerUserUpdate(
        requestBody: UpdateUserInput,
    ): CancelablePromise<User> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/v1/user/update',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
