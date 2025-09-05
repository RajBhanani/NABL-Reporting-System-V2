import { type APIResponse } from '../types/api.d';
import { type LoginRequest, type RegisterRequest } from '../types/auth.d';
import axios from './axios';

let accessToken: string | null = null;

export const getAccessToken = () => accessToken;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const register = async (request: RegisterRequest) => {
  const { data } = await axios.post<APIResponse<null>>(
    '/auth/register',
    request
  );
  return data.data;
};

export const login = async (request: LoginRequest) => {
  const { data } = await axios.post<APIResponse<string>>(
    '/auth/login',
    request
  );
  setAccessToken(data.data);
  return data.data;
};

export const refreshAccessToken = async () => {
  const { data } = await axios.get<APIResponse<string>>(
    '/auth/refresh-token',
    {}
  );
  setAccessToken(data.data);
  return data.data;
};

export const me = async () => {
  const { data } = await axios.get<APIResponse<{ id: string; role: string }>>(
    '/auth/me',
    {}
  );
  return data.data;
};

export const logout = async () => {
  await axios.post('/auth/logout');
  setAccessToken(null);
};
