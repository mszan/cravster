/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ExceptionCode } from './ExceptionCode';

export type ForbiddenException = {
    /**
     * Date in ISO 8601.
     */
    timeStamp: string;
    /**
     * Internal exception code.
     */
    exceptionCode: ExceptionCode;
    /**
     * Detailed description of an exception.
     */
    message: string;
    /**
     * HTTP status of an exception.
     */
    httpStatus: number;
};

