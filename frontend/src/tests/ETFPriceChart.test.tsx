import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ETFPriceChart } from '../components/etf_monitor/ETFPriceChart';

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => (
    <div data-testid="line-chart" data-length={data.length}>
      {children}
    </div>
  ),
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Brush: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="brush">{children}</div>
  ),
  AreaChart: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => (
    <div data-testid="area-chart" data-length={data.length}>
      {children}
    </div>
  ),
  Area: () => <div data-testid="area" />,
}));

describe('ETFPriceChart', () => {
  it('should render empty state when chartData is empty', () => {
    render(<ETFPriceChart chartData={{}} />);

    expect(screen.getByText('No price history available.')).toBeInTheDocument();
    expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();
  });

  it('should render chart components when valid data is provided', () => {
    render(
      <ETFPriceChart
        chartData={{
          '2024-01-01': 100.25,
          '2024-01-02': 101.75,
          '2024-01-03': 99.5,
        }}
      />
    );

    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('x-axis')).toBeInTheDocument();
    expect(screen.getByTestId('y-axis')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    expect(screen.getByTestId('brush')).toBeInTheDocument();
    expect(screen.getByTestId('area-chart')).toBeInTheDocument();
  });

  it('should filter out invalid numeric values and still render the chart', () => {
    render(
      <ETFPriceChart
        chartData={{
          '2024-01-01': 100.25,
          '2024-01-02': Number.NaN,
          '2024-01-03': 99.5,
        }}
      />
    );

    const lineChart = screen.getByTestId('line-chart');
    expect(lineChart).toBeInTheDocument();
    expect(lineChart).toHaveAttribute('data-length', '2');
  });

  it('should render empty state when all values are invalid', () => {
    render(
      <ETFPriceChart
        chartData={{
          '2024-01-01': Number.NaN,
          '2024-01-02': Number.NaN,
        }}
      />
    );

    expect(screen.getByText('No price history available.')).toBeInTheDocument();
  });

  it('should handle unsorted input data without crashing', () => {
    render(
      <ETFPriceChart
        chartData={{
          '2024-01-03': 103,
          '2024-01-01': 100,
          '2024-01-02': 101,
        }}
      />
    );

    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('area-chart')).toBeInTheDocument();
  });
});