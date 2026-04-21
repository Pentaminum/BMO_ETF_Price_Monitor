import { useState, useEffect } from 'react';
import axios from 'axios';
import { APP_CONFIG } from '../utils/appConfig';

export const useHealthCheck = () => {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await axios.get(APP_CONFIG.HEALTH_CHECK_URL, {
          timeout: APP_CONFIG.API_TIMEOUT,
        });
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