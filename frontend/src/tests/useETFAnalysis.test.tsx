import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { useETFAnalysis } from '../hooks/useETFAnalysis';
import apiClient, { ApiError } from '../api/apiClient';

vi.mock('../api/apiClient', async () => {
  const actual = await vi.importActual<typeof import('../api/apiClient')>('../api/apiClient');

  return {
    ...actual,
    default: {
      ...actual.default,
      post: vi.fn(),
    },
  };
});

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

describe('useETFAnalysis', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully analyze ETF CSV file', async () => {
    const mockResponse = {
      status: 'success' as const,
      data: {
        reconstructed_history: {
          '2024-01-01': 100.25,
          '2024-01-02': 101.75,
        },
        all_constituents: [
          {
            name: 'Apple',
            weight: 10.5,
            latest_close_price: 200.12,
            holding_size: 50,
          },
          {
            name: 'Microsoft',
            weight: 8.2,
            latest_close_price: 420.45,
            holding_size: 25,
          },
        ],
        top_5_holdings: [
          {
            name: 'Apple',
            weight: 10.5,
            latest_close_price: 200.12,
            holding_size: 50,
          },
        ],
      },
    };

    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: mockResponse,
    } as Awaited<ReturnType<typeof apiClient.post>>);

    const { result } = renderHook(() => useETFAnalysis(), {
      wrapper: createWrapper(),
    });

    const file = new File(['name,weight\nAAPL,0.105'], 'sample.csv', {
      type: 'text/csv',
    });

    result.current.mutate(file);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(apiClient.post).toHaveBeenCalledTimes(1);
    expect(apiClient.post).toHaveBeenCalledWith(
      'analyze_etf',
      expect.any(FormData),
    );

    expect(result.current.data).toEqual(mockResponse);
  });

  it('should return ApiError when API responds with structured error', async () => {
    const mockError = new ApiError('Invalid CSV file format', 'INVALID_FILE_ERROR');

    vi.mocked(apiClient.post).mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useETFAnalysis(), {
      wrapper: createWrapper(),
    });

    const file = new File(['bad content'], 'bad.csv', {
      type: 'text/csv',
    });

    result.current.mutate(file);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(apiClient.post).toHaveBeenCalledTimes(1);
    expect(result.current.error).toBeInstanceOf(ApiError);
    expect(result.current.error?.message).toBe('Invalid CSV file format');
    expect(result.current.error?.error_type).toBe('INVALID_FILE_ERROR');
  });

  it('should return default ApiError message when server response has no structured body', async () => {
    const mockError = new ApiError('An unexpected server error occurred');

    vi.mocked(apiClient.post).mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useETFAnalysis(), {
      wrapper: createWrapper(),
    });

    const file = new File(['bad content'], 'server-error.csv', {
      type: 'text/csv',
    });

    result.current.mutate(file);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(apiClient.post).toHaveBeenCalledTimes(1);
    expect(result.current.error).toBeInstanceOf(ApiError);
    expect(result.current.error?.message).toBe('An unexpected server error occurred');
    expect(result.current.error?.error_type).toBeUndefined();
  });
});