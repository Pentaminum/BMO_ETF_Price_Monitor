import { describe, it, expect, afterEach, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { useHealthCheck } from '../hooks/useHealthCheck';
import { server } from './setup';
import { APP_CONFIG } from '../utils/appConfig';
import apiClient from '../api/apiClient';

describe('useHealthCheck', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should return true when health check endpoint responds with online status', async () => {
    server.use(
      http.get(APP_CONFIG.HEALTH_CHECK_URL, () => {
        return HttpResponse.json({
          status: 'online',
          message: 'Backend is running',
          version: '1.0.0',
        });
      })
    );

    const { result } = renderHook(() => useHealthCheck());

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it('should return false when health check endpoint responds with offline status', async () => {
    server.use(
      http.get(APP_CONFIG.HEALTH_CHECK_URL, () => {
        return HttpResponse.json({
          status: 'offline',
        });
      })
    );

    const { result } = renderHook(() => useHealthCheck());

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  it('should return false when health check request fails', async () => {
    server.use(
      http.get(APP_CONFIG.HEALTH_CHECK_URL, () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useHealthCheck());

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  it('should poll the health endpoint every 30 seconds', async () => {
    vi.useFakeTimers();

    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({
        data: { status: 'online' },
    } as Awaited<ReturnType<typeof apiClient.get>>);

    renderHook(() => useHealthCheck());

    expect(getSpy).toHaveBeenCalledTimes(1);

    await act(async () => {
        await vi.advanceTimersByTimeAsync(30000);
    });
    expect(getSpy).toHaveBeenCalledTimes(2);

    await act(async () => {
        await vi.advanceTimersByTimeAsync(30000);
    });
    expect(getSpy).toHaveBeenCalledTimes(3);
    });
});