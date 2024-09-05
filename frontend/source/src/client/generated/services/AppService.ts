/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class AppService {

    /**
     * Check application health
     * Check whether application has started successfully and is ready to process incomming requests.
     * @returns any
     * @throws ApiError
     */
    public static appControllerGetHealthcheck(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/healthcheck',
        });
    }

}
