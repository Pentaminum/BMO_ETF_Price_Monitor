import axios, { AxiosError } from 'axios';
import { APP_CONFIG } from '../utils/appConfig';
import type { ApiErrorResponse } from '../types/etf_data';
import { logger } from '../utils/logger';

export class ApiError extends Error {
    error_type?: ApiErrorResponse['error_type'];

    constructor(message: string, error_type?: ApiErrorResponse['error_type']) {
        super(message);
        this.name = 'ApiError';
        this.error_type = error_type;
    }
}

const client = axios.create({
    baseURL: APP_CONFIG.API_BASE_URL,
    timeout: APP_CONFIG.API_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

client.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiErrorResponse>) => {
        const errorData = error.response?.data;
        const message = errorData?.message || 'An unexpected server error occurred';

        if (errorData?.error_type) {
            logger.error(`API_ERROR - ${errorData.error_type}: ${message}`);
        }

        return Promise.reject(new ApiError(message, errorData?.error_type));
    }
);

export default client;