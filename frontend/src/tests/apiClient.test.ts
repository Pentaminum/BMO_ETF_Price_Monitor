import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import apiClient from '../api/apiClient';
import { APP_CONFIG } from '../utils/appConfig';
import { server } from './setup';

const TEST_ENDPOINT = `${APP_CONFIG.API_BASE_URL}test-endpoint`;

describe('ApiClient Interceptor & Error Handling', () => {
  it('should return data directly on a successful response', async () => {
    server.use(
      http.post(TEST_ENDPOINT, () => {
        return HttpResponse.json({
          status: 'success',
          value: 123,
        });
      })
    );

    const response = await apiClient.post('test-endpoint', { hello: 'world' });

    expect(response.data).toEqual({
      status: 'success',
      value: 123,
    });
  });

  it('should transform a structured server error into an ApiError instance', async () => {
    const errorResponse = {
      status: 'error',
      message: 'Invalid CSV format detected',
      error_type: 'INVALID_FILE_ERROR' as const,
    };

    server.use(
      http.post(TEST_ENDPOINT, () => {
        return HttpResponse.json(errorResponse, { status: 400 });
      })
    );

    await expect(apiClient.post('test-endpoint', { hello: 'world' })).rejects.toMatchObject({
      name: 'ApiError',
      message: errorResponse.message,
      error_type: errorResponse.error_type,
    });
  });

  it('should handle fallback for unexpected server errors (500)', async () => {
    server.use(
      http.post(TEST_ENDPOINT, () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    await expect(apiClient.post('test-endpoint', { hello: 'world' })).rejects.toMatchObject({
      name: 'ApiError',
      message: 'An unexpected server error occurred',
      error_type: undefined,
    });
  });
});