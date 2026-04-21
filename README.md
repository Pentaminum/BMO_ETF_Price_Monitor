# ETF Price Monitor

A robust full-stack application designed to monitor ETF components, prices, and weights with high precision and reliability. Built for the BMO Capital Markets Data Cognition Team assessment.

## Quick Start (Docker)
The easiest way to run the entire stack is using Docker Compose.
```bash
docker-compose up --build
```

## Tech Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, TanStack Query, Recharts
- **Backend**: Python 3.12, FastAPI, Pandas, Pydantic (v2)
- **Infrastructure**: Docker, Docker Compose, Nginx

## Architecture
### Backend: Scalable Data Processing
- **Layered Architecture**: Separated into ```API```, ```Service```, and ```Repository``` layers to decouple business logic from data access, allowing easy migration from CSV to SQL/NoSQL in the future.
- **Performance Optimization**: The 50MB+ ```prices.csv``` is loaded into memory via **FastAPI Lifespan** on startup. Calculations are performed using n**Pandas vectorized operationn**s, ensuring sub-millisecond response times for price reconstruction.
- **Robust Error Handling**: Implemented a global exception handler to convert business logic failures into structured JSON responses, ensuring the frontend handles data gaps gracefully.

### Frontend: High-Performance Visualization
- **State Management**: Utilized **TanStack Query** for efficient server-state caching and loading/error states.
- **Reactive UI**: Built with **Tailwind CS**S and **Recharts** to provide a responsive, interactive experience for traders across different screen sizes.

## Assumptions
- **Data Integrity**: Implemented a 20bps (0.002) tolerance for ETF weight sums to account for floating-point inaccuracies in financial CSV data.
- **Data Consistency**:
  - Input constituent names are normalized (stripped & uppercased).
  - Duplicate entries in the uploaded CSV are automatically aggregated.
- **Fail-Safe**: The system strictly validates constituent availability against the internal price database. Any missing constituent triggers a clear ```422 Validation Error``` to prevent skewed financial analysis.

## API Endpoints
- ```POST /api/v1/analyze_etf```: Processes CSV upload and returns reconstrucuted price history, constituent details, and top 5 biggest holdings.
- ```GET /health```: System heartbeat and dependency check.


