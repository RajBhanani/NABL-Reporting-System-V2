import type { APIResponse } from '../types/api';
import type {
  CreateParameter,
  Parameter,
  ParameterPopulated,
  UpdateParameter,
} from '../types/parameters';

import axios from './axios';

export const createParameter = async (request: CreateParameter) => {
  const { data } = await axios.post<APIResponse<Parameter>>(
    '/parameters',
    request
  );
  return data.data;
};

export const getAllParameters = async () => {
  const { data } = await axios.get<APIResponse<Parameter[]>>('/parameters');
  return data.data;
};

export const getAllParametersPopulated = async () => {
  const { data } = await axios.get<APIResponse<ParameterPopulated[]>>(
    '/parameters/populated'
  );
  return data.data;
};

export const getParametersOfSampleType = async (id: string) => {
  const { data } = await axios.get<APIResponse<ParameterPopulated[]>>(
    `/parameters/type/${id}`
  );
  return data.data;
};

export const getParameterById = async (id: string) => {
  const { data } = await axios.get<APIResponse<ParameterPopulated>>(
    `/parameters/id/${id}`
  );
  return data.data;
};

export const updateParameter = async (request: UpdateParameter) => {
  const { data } = await axios.put<APIResponse<null>>('/parameters', request);
  return data.data === null;
};

export const deleteParameter = async (id: string) => {
  const { data } = await axios.delete<APIResponse<null>>(`/parameters/${id}`);
  return data.data === null;
};
