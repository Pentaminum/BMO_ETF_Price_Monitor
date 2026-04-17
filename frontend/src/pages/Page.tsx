import { useEffect, useState } from 'react';
import { PageLayout } from '../components/common/PageLayout';
import client from '../api/client';

const Page = () => {
  const [message, setMessage] = useState('');
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    client.get('/')
      .then(res => {
        setMessage(res.data?.message || 'Connected!');
        setIsOnline(res.data?.status === 'online');
      })
      .catch(() => {
        setMessage('Backend Offline');
        setIsOnline(false);
      });
  }, []);

    return (
      <PageLayout>
        <h1>BMO ETF Price Monitor</h1>
        <div>
          <span>
            {isOnline ? 'Online' : 'Offline'}
          </span>
          <p>{message}</p>
        </div>
      </PageLayout>
    );
};

export default Page;