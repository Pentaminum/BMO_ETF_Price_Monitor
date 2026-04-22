import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FileUploadButton } from '../components/etf_monitor/FileUploadButton';

vi.mock('../utils/logger', () => ({
  logger: {
    info: vi.fn(),
  },
}));

describe('FileUploadButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render upload button in default state', () => {
    const onFileSelect = vi.fn();

    render(
      <FileUploadButton
        onFileSelect={onFileSelect}
        isPending={false}
      />
    );

    expect(screen.getByText('Upload CSV')).toBeInTheDocument();

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.disabled).toBe(false);
    expect(input.accept).toBe('.csv');
  });

  it('should call onFileSelect when a file is selected', () => {
    const onFileSelect = vi.fn();

    render(
      <FileUploadButton
        onFileSelect={onFileSelect}
        isPending={false}
      />
    );

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['name,weight\nAAPL,1.0'], 'sample.csv', {
      type: 'text/csv',
    });

    fireEvent.change(input, {
      target: {
        files: [file],
      },
    });

    expect(onFileSelect).toHaveBeenCalledTimes(1);
    expect(onFileSelect).toHaveBeenCalledWith(file);
  });

  it('should render loading state and disable input when pending', () => {
    const onFileSelect = vi.fn();

    render(
      <FileUploadButton
        onFileSelect={onFileSelect}
        isPending={true}
      />
    );

    expect(screen.getByText('Analyzing...')).toBeInTheDocument();

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });
});