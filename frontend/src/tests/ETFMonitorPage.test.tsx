import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ETFMonitorPage from '../pages/ETFMonitorPage';

const mockUseHealthCheck = vi.fn();
const mockUseETFAnalysis = vi.fn();

vi.mock('../hooks/useHealthCheck', () => ({
  useHealthCheck: () => mockUseHealthCheck(),
}));

vi.mock('../hooks/useETFAnalysis', () => ({
  useETFAnalysis: () => mockUseETFAnalysis(),
}));

vi.mock('../components/common/PageLayout', () => ({
  PageLayout: ({
    children,
    isOnline,
  }: {
    children: React.ReactNode;
    isOnline: boolean;
  }) => (
    <div>
      <div data-testid="page-layout-status">{isOnline ? 'LIVE' : 'OFFLINE'}</div>
      {children}
    </div>
  ),
}));

vi.mock('../components/etf_monitor/FileUploadButton', () => ({
  FileUploadButton: ({
    onFileSelect,
    isPending,
  }: {
    onFileSelect: (file: File) => void;
    isPending: boolean;
  }) => (
    <button
      onClick={() => onFileSelect(new File(['name,weight\nAAPL,1.0'], 'sample.csv', { type: 'text/csv' }))}
      data-testid="upload-button"
      data-pending={isPending ? 'true' : 'false'}
    >
      Upload
    </button>
  ),
}));

vi.mock('../components/etf_monitor/ErrorAlert', () => ({
  ErrorAlert: ({
    message,
    onDismiss,
  }: {
    message?: string;
    onDismiss: () => void;
  }) => (
    <div>
      <span>{message}</span>
      <button onClick={onDismiss}>Dismiss Error</button>
    </div>
  ),
}));

vi.mock('../components/etf_monitor/ETFPriceChart', () => ({
  ETFPriceChart: ({ chartData }: { chartData: Record<string, number> }) => (
    <div data-testid="price-chart">{JSON.stringify(chartData)}</div>
  ),
}));

vi.mock('../components/etf_monitor/TopHoldingsBarChart', () => ({
  TopHoldingsBarChart: ({ holdings }: { holdings: unknown[] }) => (
    <div data-testid="top-holdings-chart">{holdings.length}</div>
  ),
}));

vi.mock('../components/etf_monitor/ConstituentsTable', () => ({
  ConstituentsTable: ({ list }: { list: unknown[] }) => (
    <div data-testid="constituents-table">{list.length}</div>
  ),
}));

describe('ETFMonitorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseHealthCheck.mockReturnValue(true);
    mockUseETFAnalysis.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      data: undefined,
      isError: false,
      error: null,
      reset: vi.fn(),
    });
  });

  it('should render page title and section titles', () => {
    render(<ETFMonitorPage />);

    expect(screen.getByText('ETF Price Monitor')).toBeInTheDocument();
    expect(screen.getByText('Historical prices and constituent analysis')).toBeInTheDocument();
    expect(screen.getByText('ETF Price History')).toBeInTheDocument();
    expect(screen.getByText('Top 5 Holdings')).toBeInTheDocument();
    expect(screen.getByText('Constituents Details')).toBeInTheDocument();
  });

  it('should pass online status from useHealthCheck to PageLayout', () => {
    mockUseHealthCheck.mockReturnValue(true);

    render(<ETFMonitorPage />);

    expect(screen.getByTestId('page-layout-status')).toHaveTextContent('LIVE');
  });

  it('should pass offline status from useHealthCheck to PageLayout', () => {
    mockUseHealthCheck.mockReturnValue(false);

    render(<ETFMonitorPage />);

    expect(screen.getByTestId('page-layout-status')).toHaveTextContent('OFFLINE');
  });

  it('should pass pending state to FileUploadButton', () => {
    mockUseETFAnalysis.mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
      data: undefined,
      isError: false,
      error: null,
      reset: vi.fn(),
    });

    render(<ETFMonitorPage />);

    expect(screen.getByTestId('upload-button')).toHaveAttribute('data-pending', 'true');
  });

  it('should call analyzeEtf when a file is selected', () => {
    const mutate = vi.fn();

    mockUseETFAnalysis.mockReturnValue({
      mutate,
      isPending: false,
      data: undefined,
      isError: false,
      error: null,
      reset: vi.fn(),
    });

    render(<ETFMonitorPage />);

    fireEvent.click(screen.getByTestId('upload-button'));

    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate.mock.calls[0][0]).toBeInstanceOf(File);
  });

  it('should render ErrorAlert when analysis fails', () => {
    const reset = vi.fn();

    mockUseETFAnalysis.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      data: undefined,
      isError: true,
      error: { message: 'Invalid CSV file format' },
      reset,
    });

    render(<ETFMonitorPage />);

    expect(screen.getByText('Invalid CSV file format')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Dismiss Error'));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('should pass analysis data to child visualization components', () => {
    const mockData = {
      data: {
        reconstructed_history: {
          '2024-01-01': 100.25,
          '2024-01-02': 101.75,
        },
        top_5_holdings: [
          {
            name: 'AAPL',
            weight: 0.4,
            latest_close_price: 200.12,
            holding_size: 80.05,
          },
        ],
        all_constituents: [
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
        ],
      },
    };

    mockUseETFAnalysis.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      data: mockData,
      isError: false,
      error: null,
      reset: vi.fn(),
    });

    render(<ETFMonitorPage />);

    expect(screen.getByTestId('price-chart')).toHaveTextContent(
      JSON.stringify(mockData.data.reconstructed_history)
    );
    expect(screen.getByTestId('top-holdings-chart')).toHaveTextContent('1');
    expect(screen.getByTestId('constituents-table')).toHaveTextContent('2');
  });

  it('should pass empty fallback values when no analysis data exists', () => {
    render(<ETFMonitorPage />);

    expect(screen.getByTestId('price-chart')).toHaveTextContent('{}');
    expect(screen.getByTestId('top-holdings-chart')).toHaveTextContent('0');
    expect(screen.getByTestId('constituents-table')).toHaveTextContent('0');
  });
});