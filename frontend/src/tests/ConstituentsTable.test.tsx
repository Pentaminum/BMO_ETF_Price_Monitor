import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { ConstituentsTable } from '../components/etf_monitor/ConstituentsTable';
import type { Constituent } from '../types/etf_data';

const mockList: Constituent[] = [
  {
    name: 'MSFT',
    weight: 0.25,
    latest_close_price: 420.45,
    holding_size: 105.11,
  },
  {
    name: 'AAPL',
    weight: 0.4,
    latest_close_price: 200.12,
    holding_size: 80.05,
  },
  {
    name: 'NVDA',
    weight: 0.15,
    latest_close_price: 900.5,
    holding_size: 135.08,
  },
];

describe('ConstituentsTable', () => {
  it('should render constituent rows', () => {
    render(<ConstituentsTable list={mockList} />);

    expect(screen.getByText('AAPL')).toBeInTheDocument();
    expect(screen.getByText('MSFT')).toBeInTheDocument();
    expect(screen.getByText('NVDA')).toBeInTheDocument();
    expect(screen.getByText('40.00 %')).toBeInTheDocument();
    expect(screen.getByText('$200.12')).toBeInTheDocument();
  });

  it('should filter rows by search term', () => {
    render(<ConstituentsTable list={mockList} />);

    const input = screen.getByPlaceholderText('Search constituent name...');
    fireEvent.change(input, { target: { value: 'AAP' } });

    expect(screen.getByText('AAPL')).toBeInTheDocument();
    expect(screen.queryByText('MSFT')).not.toBeInTheDocument();
    expect(screen.queryByText('NVDA')).not.toBeInTheDocument();
  });

  it('should render rows sorted by weight descending by default', () => {
    render(<ConstituentsTable list={mockList} />);

    const rows = screen.getAllByRole('row');
    const bodyRows = rows.slice(1);

    expect(within(bodyRows[0]).getByText('AAPL')).toBeInTheDocument();
    expect(within(bodyRows[1]).getByText('MSFT')).toBeInTheDocument();
    expect(within(bodyRows[2]).getByText('NVDA')).toBeInTheDocument();
  });

  it('should toggle sorting by name when name header is clicked twice', () => {
    render(<ConstituentsTable list={mockList} />);

    const nameHeader = screen.getByText(/CONSTITUENT NAME/i);

    fireEvent.click(nameHeader);

    let rows = screen.getAllByRole('row');
    let bodyRows = rows.slice(1);

    expect(within(bodyRows[0]).getByText('NVDA')).toBeInTheDocument();
    expect(within(bodyRows[1]).getByText('MSFT')).toBeInTheDocument();
    expect(within(bodyRows[2]).getByText('AAPL')).toBeInTheDocument();

    fireEvent.click(nameHeader);

    rows = screen.getAllByRole('row');
    bodyRows = rows.slice(1);

    expect(within(bodyRows[0]).getByText('AAPL')).toBeInTheDocument();
    expect(within(bodyRows[1]).getByText('MSFT')).toBeInTheDocument();
    expect(within(bodyRows[2]).getByText('NVDA')).toBeInTheDocument();
    });

  it('should show empty state when list is empty', () => {
    render(<ConstituentsTable list={[]} />);

    expect(screen.getByText('No constituent details available.')).toBeInTheDocument();
  });

  it('should show empty state when search yields no results', () => {
    render(<ConstituentsTable list={mockList} />);

    const input = screen.getByPlaceholderText('Search constituent name...');
    fireEvent.change(input, { target: { value: 'TSLA' } });

    expect(screen.getByText('No constituent details available.')).toBeInTheDocument();
  });
});