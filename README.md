# ETF Price Monitor

A robust full-stack application designed to monitor ETF components, prices, and weights with high precision and reliability. Built for the BMO Capital Markets Data Cognition Team assessment.

## Quick Start

**Option 1: Docker (Recommended)**

The easiest way to run the entire stack is using Docker Compose. This will spin up both the frontend and backend simultaneously.
```bash
docker compose up --build
```
The application will be available at ```http://localhost:5173```.

**Option 2: Local Development (Manual Setup)**

If you prefer to run the application locally without Docker, you will need two separate terminal windows.

**1. Backend setup**
```
# Navigate to backend directory
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# Install required dependencies
pip install -r requirements.txt

# Start the backend server
uvicorn app.main:app --reload
```
The API will be available at ```http://localhost:8000```.

**2. Frontend setup**
```
# Navigate to frontend directory
cd frontend 

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```
The frontend UI will be available at ```http://localhost:5173```.

## Tech Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, TanStack Query, Recharts
- **Backend**: Python 3.12, FastAPI, Pandas, Pydantic (v2)
- **Infrastructure**: Docker, Docker Compose, Nginx

## Architecture
### Backend: Scalable Data Processing
- **Layered Architecture (N-Tier)**: The system is strictly decoupled into **API**, **Service**, and **Repository** layers. This ensures business logic is isolated from data access, allowing for seamless transitions from CSV to relational databases (e.g., PostgreSQL) in the future.
- **In-Memory Caching**: The historical price dataset (~50MB+) is preloaded during the **FastAPI lifespan** startup phase and reused through a cached service dependency, reducing repeated disk I/O and improving request performance.
- **Vectorized Computations**: Calculations for ETF price reconstruction are performed using **Pandas vectorized operations**. This bypasses Python’s native loops, providing high-speed financial processing suitable for real-time trading environments.
- **Global Exception Handling**: A centralized error handling mechanism converts business logic failures into structured JSON responses, ensuring the frontend handles data gaps or validation errors gracefully.

### Frontend: High-Performance Visualization
- **State Management**: Utilized **TanStack Query** to handle ETF analysis requests with built-in loading, success, reset, and error flows.
- **Interactive Analytics Dashboard**: Built a responsive UI with **Tailwind CSS** and **Recharts**, including a historical price chart, top holdings bar chart, and searchable/sortable constituents table.
- **Memoized Data Processing**: Leveraged ```useMemo``` to efficiently transform chart data, compute chart domains, and derive filtered/sorted table views without unnecessary recalculation on every render.
- **Reusable Frontend Architecture**: Separated API access, custom hooks, layout, and visualization components to keep the page layer focused on orchestration rather than business logic.
- **Advanced Data Visualization**:
  - **Custom Tooltips** for precise hover-based financial insights
  - **Brush-based zooming** for granular time-series inspection
  - Error, loading, and empty states for more resilient user interaction

## Data Logic & Assumptions
Given the nature of ETF data and the requirement for precision, the following business rules and assumptions were implemented:

- **Strict Weight Validation**:
  - **Negative Weight Rejection**: Assuming a long-only ETF structure for this challenge, the system rejects any negative constituent weights to preserve data integrity.
  - **Floating-Point Precision**: To account for standard floating-point inaccuracies in CSV parsing, a **20 bps (0.002) tolerance** is applied to weight-sum validation, accepting totals between **0.998 and 1.002**.
  - **Missing or Non-Numeric Weight Checks**: The system rejects missing or non-numeric weight values before performing any portfolio calculations.
- **Data Consistency & Normalization**:
  - **Input Normalization**: All constituent names are automatically trimmed and converted to uppercase to prevent matching errors caused by casing or whitespace differences.
  - **Duplicate Aggregation**: If the uploaded CSV contains duplicate constituent names, their weights are automatically aggregated to produce a consolidated composition view.
- **Fail-Safe Mechanisms**:
  - **Data Availability Check**: Every uploaded constituent is validated against the internal historical price dataset. If any constituent is unsupported or missing from the internal dataset, the request returns a `422 Validation Error` to prevent incomplete or misleading analysis.
  - **File Integrity Checks**: The system explicitly rejects empty uploads, missing constituent names, and CSV files missing the required `name` and `weight` columns.
  - **Internal Data Dependency Check**: If the internal price dataset is missing, empty, or invalid, the API fails fast with an internal server error rather than serving partial or unreliable results.

## API Endpoints
- ```POST /api/v1/analyze_etf```: Processes CSV upload and returns reconstructed price history, constituent details, and top 5 biggest holdings.
- ```GET /health```: System heartbeat and dependency check.

## Testing
- **Frontend**: Tested hooks, API client behavior, and core UI components using **Vitest** and **React Testing Library**.
- **Backend**: Tested repository, service, and endpoint validation flows using **Pytest**.
