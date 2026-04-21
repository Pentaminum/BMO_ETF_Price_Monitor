# ETF Price Monitor

A robust full-stack application designed to monitor ETF components, prices, and weights with high precision and reliability. Built for the BMO Capital Markets Data Cognition Team assessment.

## 🚀 Quick Start (Docker)
The easiest way to run the entire stack is using Docker Compose.
```bash
docker-compose up --build
```

## 🛠 Tech Stack
- Frontend: React 19, TypeScript, Vite, Tailwind CSS, TanStack Query, Recharts
- Backend: Python 3.12, FastAPI, Pandas, Pydantic (v2)
- Infrastructure: Docker, Docker Compose, Nginx

## ✨ Key Features
### 1. Backend: Financial Precision & Robustness
- Dependency Injection (DI): Implemented a DI pattern for the ```ETFAnalyticsService``` to ensure high testability and clean separation of concerns.
- Data Integrity:
-- Duplicate Handling: Automatically aggregates weights for duplicate tickers (e.g., AAPL split across multiple rows) using Pandas grouping logic.
-- Floating-Point Tolerance: Implemented a ```0.0001``` (10bps) tolerance level for ETF weight validations to handle standard floating-point arithmetic issues in financial data.
- Error Handling: Centralized exception handlers map business logic failures to consistent, descriptive API error responses (e.g., ```VALIDATION_ERROR```, ```DATA_NOT_FOUND```).

### 2. Frontend: Professional UX/UI
- Interactive Data Visualization:
-- Zoomable Charts: Recharts integrated with ```Brush``` functionality for granular inspection of historical price trends.
-- Custom Tooltips: High-contrast tooltips with clear data formatting for easy inspection of financial metrics.
- Optimized Performance: Leveraged ```useMemo``` for client-side sorting and filtering, ensuring a smooth 60fps experience even with large constituent lists.
- UX Refinement: Optimized Table Header interactions using Tailwind's ```group-hover``` and ```opacity``` transitions to prevent Layout Shift (jittering) during sorting.

### 3. Infrastructure: Production-Ready Setup
- Multi-stage Docker Builds: Optimized production images by separating the build environment from the runtime environment, resulting in minimal image footprints.
- Nginx SPA Support: Pre-configured Nginx ```try_files``` to support Client-Side Routing fallback, preventing 404 errors on page refreshes.


