# ETF Price Monitor

A robust full-stack application designed to monitor ETF components, prices, and weights with high precision and reliability. Built for the BMO Capital Markets Data Cognition Team assessment.

## Quick Start

**Option 1: Docker (Recommended)**

The easiest way to run the entire stack is using Docker Compose. This will spin up both the frontend and backend simultaneously.
```bash
docker-compose up --build
```

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
- **In-Memory Caching**: To ensure sub-millisecond response times, the historical price dataset (~50MB+) is loaded into memory once during the **FastAPI Lifespan** startup phase.
- **Vectorized Computations**: Calculations for ETF price reconstruction are performed using **Pandas vectorized operations**. This bypasses Python’s native loops, providing high-speed financial processing suitable for real-time trading environments.
- **Global Exception Handling**: A centralized error handling mechanism converts business logic failures into structured JSON responses, ensuring the frontend handles data gaps or validation errors gracefully.

### Frontend: High-Performance Visualization
- **State Management**: Utilized **TanStack Query** to manage server-state, caching, and reactive loading/error states.
- **Reactive UI**: Built with **Tailwind CSS** and **Recharts** for the time-series plot and bar charts, providing traders with a responsive and interactive data exploration experience.

## Data Logic & Assumptions
Given the nature of ETF data and the requirement for precision, the following business rules and assumptions were implemented:

- **Strict Weight Validation**:
  - **Zero-Tolerance for Negative Weights**: Assuming a long-only ETF structure for this challenge, the system strictly rejects negative weight values to ensure data integrity.
  - **Floating-Point Precision**: To account for standard floating-point inaccuracies in CSV parsing, a **20bps (0.002) tolerance** is applied to the weight sum validation (accepting sums between 0.998 and 1.002).
- **Data Consistency & Normalization**:
  - **Input Normalization**: All constituent names are automatically stripped of whitespace and converted to uppercase to prevent matching errors.
  - **Duplicate Aggregation**: If the uploaded CSV contains duplicate entries for the same constituents, the system automatically aggregates their weights to provide a consolidated view.
- **Fail-Safe Mechanisms**:
  - **Data Availability Check**: The system validates all uploaded constituents against the internal price database. If a constituent is missing, the request triggers a ```422 Validation Error``` to prevent skewed or inaccurate financial analysis.
  - **Empty File Handling**: Comprehensive checks are in place for empty files or missing required columns (```name```, ```weight```) to maintain server stability.

## API Endpoints
- ```POST /api/v1/analyze_etf```: Processes CSV upload and returns reconstructed price history, constituent details, and top 5 biggest holdings.
- ```GET /health```: System heartbeat and dependency check.
