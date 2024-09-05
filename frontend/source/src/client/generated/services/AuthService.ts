/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LoginLocalInput } from '../models/LoginLocalInput';
import type { LoginLocalResponse } from '../models/LoginLocalResponse';
import type { RefreshTokensResponse } from '../models/RefreshTokensResponse';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class AuthService {

    /**
     * Login user
     * @param requestBody
     * @returns LoginLocalResponse
     * @throws ApiError
     */
    public static authControllerLogin(
        requestBody: LoginLocalInput,
    ): CancelablePromise<LoginLocalResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/auth/login',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Refresh tokens
     * @returns RefreshTokensResponse
     * @throws ApiError
     */
    public static authControllerRefreshTokens(): CancelablePromise<RefreshTokensResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/auth/refreshTokens',
        });
    }

}
