import { PageLayout } from '../components/common/PageLayout';
import { useHealthCheck } from '../hooks/useHealthCheck';

const ETFMonitorPage = () => {
  const isOnline = useHealthCheck();

    return (
      <PageLayout isOnline={isOnline}>
        <h1>BMO ETF Price Monitor</h1>
      </PageLayout>
    );
};

export default ETFMonitorPage;