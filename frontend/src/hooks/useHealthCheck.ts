import { useState, useEffect } from 'react';
import client from '../api/apiClient';

export const useHealthCheck = () => {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const checkStatus = () => {
      client.get('/')
        .then(res => setIsOnline(res.data?.status === 'online'))
        .catch(() => setIsOnline(false));
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000); 
    return () => clearInterval(interval);
  }, []);

  return isOnline;
};