import Axios from 'axios';

import {
  getAccessToken,
  refreshAccessToken,
  setAccessToken,
} from './auth.service';

const axios = Axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

axios.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axios.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    if (
      originalRequest.url === '/auth/me' &&
      err.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const newToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axios(originalRequest);
      } catch {
        setAccessToken(null);
      }
    }
    return Promise.reject(err.response?.data ?? err);
  }
);

export default axios;
