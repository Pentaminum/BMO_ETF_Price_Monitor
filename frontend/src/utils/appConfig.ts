export const APP_CONFIG = {
    PROJECT_NAME: 'BMO ETF Price Monitor',
    API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
    API_TIMEOUT: 5000,
} as const;