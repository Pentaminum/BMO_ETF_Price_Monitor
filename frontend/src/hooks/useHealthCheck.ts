import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { APP_CONFIG } from '../utils/appConfig';

export const useHealthCheck = () => {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await apiClient.get(APP_CONFIG.HEALTH_CHECK_URL);
        setIsOnline(res.data?.status === 'online');
      } catch {
        setIsOnline(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000); 
    return () => clearInterval(interval);
  }, []);

  return isOnline;
};