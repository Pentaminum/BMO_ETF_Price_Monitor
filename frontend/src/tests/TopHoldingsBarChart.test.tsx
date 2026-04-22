import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TopHoldingsBarChart } from '../components/etf_monitor/TopHoldingsBarChart';
import type { Constituent } from '../types/etf_data';

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({
    children,
    data,
  }: {
    children: React.ReactNode;
    data: unknown[];
  }) => (
    <div data-testid="bar-chart" data-length={data.length}>
      {children}
    </div>
  ),
  Bar: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="bar">{children}</div>
  ),
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  LabelList: () => <div data-testid="label-list" />,
}));

const mockHoldings: Constituent[] = [
  {
    name: 'AAPL',
    weight: 0.4,
    latest_close_price: 200.12,
    holding_size: 80.05,
  },
  {
    name: 'MSFT',
    weight: 0.25,
    latest_close_price: 420.45,
    holding_size: 105.11,
  },
  {
    name: 'NVDA',
    weight: 0.15,
    latest_close_price: 900.5,
    holding_size: 135.08,
  },
];

describe('TopHoldingsBarChart', () => {
  it('should render empty state when holdings are empty', () => {
    render(<TopHoldingsBarChart holdings={[]} />);

    expect(screen.getByText('No holdings data available.')).toBeInTheDocument();
    expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
  });

  it('should render chart components when holdings data is provided', () => {
    render(<TopHoldingsBarChart holdings={mockHoldings} />);

    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('x-axis')).toBeInTheDocument();
    expect(screen.getByTestId('y-axis')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    expect(screen.getByTestId('bar')).toBeInTheDocument();
    expect(screen.getByTestId('label-list')).toBeInTheDocument();
  });

  it('should map holdings into chart data with matching length', () => {
    render(<TopHoldingsBarChart holdings={mockHoldings} />);

    expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-length', '3');
  });

  it('should render chart with a single holding', () => {
    render(<TopHoldingsBarChart holdings={[mockHoldings[0]]} />);

    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-length', '1');
  });

  it('should handle zero values without crashing', () => {
    const zeroHoldings: Constituent[] = [
      {
        name: 'CASH',
        weight: 0,
        latest_close_price: 0,
        holding_size: 0,
      },
    ];

    render(<TopHoldingsBarChart holdings={zeroHoldings} />);

    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-length', '1');
  });
});