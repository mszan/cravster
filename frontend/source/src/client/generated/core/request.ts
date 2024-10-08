/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
// @ts-nocheck
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import axios from "axios";
import FormData from "form-data";

import _ from "lodash";
import store from "store";
import { configInstance } from "../../../config";
import { ApiError } from "./ApiError";
import { ApiRequestOptions } from "./ApiRequestOptions";
import { ApiResult } from "./ApiResult";
import { CancelablePromise, OnCancel } from "./CancelablePromise";
import { OpenAPIConfig } from "./OpenAPI";

const axiosInstance = axios.create();

axiosInstance.interceptors.request.use(
    config => {
        const accessToken = store.get("user")?.accessToken;
        if (accessToken) {
            config.headers!["Authorization"] = `Bearer ${accessToken}`;
        }
        return config;
    },
    e => {
        return Promise.reject(e);
    },
);

axiosInstance.interceptors.response.use(
    res => {
        return res;
    },
    async e => {
        const originalConfig = e.config;

        if (e.response) {
            // check whether access token is expired
            if (e.response.status === 403 && !originalConfig._retry) {
                originalConfig._retry = true;

                try {
                    const refreshTokensRes = await axios.request({
                        method: "POST",
                        url: "/v1/auth/refreshTokens",
                        baseURL: configInstance.urls.backend,
                        headers: {
                            Authorization: `Bearer ${store.get("user")?.refreshToken}`,
                        },
                    });

                    // update user entry in local storage
                    const user = _.cloneDeep(store.get("user"));
                    user.accessToken = refreshTokensRes.data.accessToken;
                    user.refreshToken = refreshTokensRes.data.refreshToken;
                    store.set("user", user);

                    return axiosInstance({
                        ...originalConfig,
                        headers: {
                            ...originalConfig.headers,
                            Authorization: `Bearer ${refreshTokensRes.data.accessToken}`,
                        },
                    });
                } catch (_e: any) {
                    if (_e.response && _e.response.data) {
                        return Promise.reject(_e.response.data);
                    }

                    return Promise.reject(_e);
                }
            }
        }

        return Promise.reject(e);
    },
);

const isDefined = <T>(value: T | null | undefined): value is Exclude<T, null | undefined> => {
    return value !== undefined && value !== null;
};

const isString = (value: any): value is string => {
    return typeof value === "string";
};

const isStringWithValue = (value: any): value is string => {
    return isString(value) && value !== "";
};

const isBlob = (value: any): value is Blob => {
    return (
        typeof value === "object" &&
        typeof value.type === "string" &&
        typeof value.stream === "function" &&
        typeof value.arrayBuffer === "function" &&
        typeof value.constructor === "function" &&
        typeof value.constructor.name === "string" &&
        /^(Blob|File)$/.test(value.constructor.name) &&
        /^(Blob|File)$/.test(value[Symbol.toStringTag])
    );
};

const isFormData = (value: any): value is FormData => {
    return value instanceof FormData;
};

const isSuccess = (status: number): boolean => {
    return status >= 200 && status < 300;
};

const base64 = (str: string): string => {
    try {
        return btoa(str);
    } catch (err) {
        // @ts-ignore
        return Buffer.from(str).toString("base64");
    }
};

const getQueryString = (params: Record<string, any>): string => {
    const qs: string[] = [];

    const append = (key: string, value: any) => {
        qs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    };

    const process = (key: string, value: any) => {
        if (isDefined(value)) {
            if (Array.isArray(value)) {
                value.forEach(v => {
                    process(key, v);
                });
            } else if (typeof value === "object") {
                Object.entries(value).forEach(([k, v]) => {
                    process(`${key}[${k}]`, v);
                });
            } else {
                append(key, value);
            }
        }
    };

    Object.entries(params).forEach(([key, value]) => {
        process(key, value);
    });

    if (qs.length > 0) {
        return `?${qs.join("&")}`;
    }

    return "";
};

const getUrl = (config: OpenAPIConfig, options: ApiRequestOptions): string => {
    const encoder = config.ENCODE_PATH || encodeURI;

    const path = options.url
        .replace("{api-version}", config.VERSION)
        .replace(/{(.*?)}/g, (substring: string, group: string) => {
            if (options.path?.hasOwnProperty(group)) {
                return encoder(String(options.path[group]));
            }
            return substring;
        });

    const url = `${config.BASE}${path}`;
    if (options.query) {
        return `${url}${getQueryString(options.query)}`;
    }
    return url;
};

const getFormData = (options: ApiRequestOptions): FormData | undefined => {
    if (options.formData) {
        const formData = new FormData();

        const process = (key: string, value: any) => {
            if (isString(value) || isBlob(value)) {
                formData.append(key, value);
            } else {
                formData.append(key, JSON.stringify(value));
            }
        };

        Object.entries(options.formData)
            .filter(([_, value]) => isDefined(value))
            .forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    value.forEach(v => process(key, v));
                } else {
                    process(key, value);
                }
            });

        return formData;
    }
    return undefined;
};

type Resolver<T> = (options: ApiRequestOptions) => Promise<T>;

const resolve = async <T>(options: ApiRequestOptions, resolver?: T | Resolver<T>): Promise<T | undefined> => {
    if (typeof resolver === "function") {
        return (resolver as Resolver<T>)(options);
    }
    return resolver;
};

const getHeaders = async (
    config: OpenAPIConfig,
    options: ApiRequestOptions,
    formData?: FormData,
): Promise<Record<string, string>> => {
    const token = await resolve(options, config.TOKEN);
    const username = await resolve(options, config.USERNAME);
    const password = await resolve(options, config.PASSWORD);
    const additionalHeaders = await resolve(options, config.HEADERS);
    const formHeaders = (typeof formData?.getHeaders === "function" && formData?.getHeaders()) || {};

    const headers = Object.entries({
        Accept: "application/json",
        ...additionalHeaders,
        ...options.headers,
        ...formHeaders,
    })
        .filter(([_, value]) => isDefined(value))
        .reduce(
            (headers, [key, value]) => ({
                ...headers,
                [key]: String(value),
            }),
            {} as Record<string, string>,
        );

    if (isStringWithValue(token)) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    if (isStringWithValue(username) && isStringWithValue(password)) {
        const credentials = base64(`${username}:${password}`);
        headers["Authorization"] = `Basic ${credentials}`;
    }

    if (options.body) {
        if (options.mediaType) {
            headers["Content-Type"] = options.mediaType;
        } else if (isBlob(options.body)) {
            headers["Content-Type"] = options.body.type || "application/octet-stream";
        } else if (isString(options.body)) {
            headers["Content-Type"] = "text/plain";
        } else if (!isFormData(options.body)) {
            headers["Content-Type"] = "application/json";
        }
    }

    return headers;
};

const getRequestBody = (options: ApiRequestOptions): any => {
    if (options.body) {
        return options.body;
    }
    return undefined;
};

const sendRequest = async <T>(
    config: OpenAPIConfig,
    options: ApiRequestOptions,
    url: string,
    body: any,
    formData: FormData | undefined,
    headers: Record<string, string>,
    onCancel: OnCancel,
): Promise<AxiosResponse<T>> => {
    const source = axios.CancelToken.source();
    const requestConfig: AxiosRequestConfig = {
        url,
        headers,
        data: body ?? formData,
        method: options.method,
        withCredentials: config.WITH_CREDENTIALS,
        cancelToken: source.token,
    };

    onCancel(() => source.cancel("The user aborted a request."));

    try {
        return await axiosInstance.request(requestConfig);
    } catch (error) {
        const axiosError = error as AxiosError<T>;
        if (axiosError.response) {
            return axiosError.response;
        }
        throw error;
    }
};

const getResponseHeader = (response: AxiosResponse<any>, responseHeader?: string): string | undefined => {
    if (responseHeader) {
        const content = response.headers[responseHeader];
        if (isString(content)) {
            return content;
        }
    }
    return undefined;
};

const getResponseBody = (response: AxiosResponse<any>): any => {
    if (response.status !== 204) {
        return response.data;
    }
    return undefined;
};

const catchErrorCodes = (options: ApiRequestOptions, result: ApiResult): void => {
    const errors: Record<number, string> = {
        400: "Bad Request",
        401: "Unauthorized",
        403: "Forbidden",
        404: "Not Found",
        500: "Internal Server Error",
        502: "Bad Gateway",
        503: "Service Unavailable",
        ...options.errors,
    };

    const error = errors[result.status];
    if (error) {
        throw new ApiError(options, result, error);
    }

    if (!result.ok) {
        throw new ApiError(options, result, "Generic Error");
    }
};

/**
 * Request method
 * @param config The OpenAPI configuration object
 * @param options The request options from the service
 * @returns CancelablePromise<T>
 * @throws ApiError
 */
export const request = <T>(config: OpenAPIConfig, options: ApiRequestOptions): CancelablePromise<T> => {
    return new CancelablePromise(async (resolve, reject, onCancel) => {
        try {
            const url = getUrl(config, options);
            const formData = getFormData(options);
            const body = getRequestBody(options);
            const headers = await getHeaders(config, options, formData);

            if (!onCancel.isCancelled) {
                const response = await sendRequest<T>(config, options, url, body, formData, headers, onCancel);
                const responseBody = getResponseBody(response);
                const responseHeader = getResponseHeader(response, options.responseHeader);

                const result: ApiResult = {
                    url,
                    ok: isSuccess(response.status),
                    status: response.status,
                    statusText: response.statusText,
                    body: responseHeader ?? responseBody,
                };

                catchErrorCodes(options, result);

                resolve(result.body);
            }
        } catch (error) {
            reject(error);
        }
    });
};
