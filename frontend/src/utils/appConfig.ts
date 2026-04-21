const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || 'http://localhost:8000';

export const APP_CONFIG = {
  PROJECT_NAME: 'BMO ETF Price Monitor',
  API_ORIGIN,
  API_BASE_URL: `${API_ORIGIN}/api/v1/`,
  HEALTH_CHECK_URL: `${API_ORIGIN}/health`,
  API_TIMEOUT: 5000,
} as const;