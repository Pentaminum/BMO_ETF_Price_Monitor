import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorAlert } from '../components/etf_monitor/ErrorAlert';

describe('ErrorAlert', () => {
  it('should render the provided error message', () => {
    const onDismiss = vi.fn();

    render(
      <ErrorAlert
        message="Invalid CSV file format."
        onDismiss={onDismiss}
      />
    );

    expect(screen.getByText('Analysis Error')).toBeInTheDocument();
    expect(screen.getByText('Invalid CSV file format.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
  });

  it('should render fallback message when no message is provided', () => {
    const onDismiss = vi.fn();

    render(
      <ErrorAlert
        onDismiss={onDismiss}
      />
    );

    expect(
      screen.getByText('An unexpected error occurred. Please check your file and try again.')
    ).toBeInTheDocument();
  });

  it('should call onDismiss when dismiss button is clicked', () => {
    const onDismiss = vi.fn();

    render(
      <ErrorAlert
        message="Something went wrong."
        onDismiss={onDismiss}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});