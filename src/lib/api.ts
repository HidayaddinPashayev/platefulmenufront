import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from './env';

type UnauthorizedHandler = () => void | Promise<void>;

export const createApiClient = (token?: string, onUnauthorized?: UnauthorizedHandler) => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  instance.interceptors.request.use((config) => {
    // Add JWT Authorization header if token provided
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Kitchen endpoints now use HttpOnly cookies - no need to attach headers
    // Browser automatically sends cookies with credentials: 'include'

    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      // Handle 401 Unauthorized for non-kitchen endpoints
      // Kitchen endpoints handle 401/403 in their components
      if (error.response?.status === 401) {
        if (onUnauthorized) {
          await onUnauthorized();
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

