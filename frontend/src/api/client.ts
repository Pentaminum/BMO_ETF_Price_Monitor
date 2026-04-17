import axios from 'axios';
import { APP_CONFIG } from '../utils/appConfig';

const client = axios.create({
    baseURL: APP_CONFIG.API_BASE_URL,
    timeout: APP_CONFIG.API_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default client;