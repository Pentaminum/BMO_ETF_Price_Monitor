import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageLayout } from '../components/common/PageLayout';

describe('PageLayout', () => {
  it('should render children content', () => {
    render(
      <PageLayout isOnline={true}>
        <div>Test Page Content</div>
      </PageLayout>
    );

    expect(screen.getByText('Test Page Content')).toBeInTheDocument();
  });

  it('should show LIVE status when isOnline is true', () => {
    render(
      <PageLayout isOnline={true}>
        <div>Dashboard</div>
      </PageLayout>
    );

    expect(screen.getByText('LIVE')).toBeInTheDocument();
    expect(screen.queryByText('OFFLINE')).not.toBeInTheDocument();
  });

  it('should show OFFLINE status when isOnline is false', () => {
    render(
      <PageLayout isOnline={false}>
        <div>Dashboard</div>
      </PageLayout>
    );

    expect(screen.getByText('OFFLINE')).toBeInTheDocument();
    expect(screen.queryByText('LIVE')).not.toBeInTheDocument();
  });

  it('should render footer text', () => {
    render(
      <PageLayout isOnline={true}>
        <div>Dashboard</div>
      </PageLayout>
    );

    expect(
      screen.getByText("© BMO Capital Markets' Data Cognition Team Assessment - Jusung Park")
    ).toBeInTheDocument();
  });

  it('should render the BMO logo image', () => {
    render(
      <PageLayout isOnline={true}>
        <div>Dashboard</div>
      </PageLayout>
    );

    expect(screen.getByAltText('BMO Logo')).toBeInTheDocument();
  });
});