import type { APIResponse } from '../types/api';
import type {
  CreateParameterSet,
  ParameterSet,
  ParameterSetPopulated,
  UpdatedParameterSet,
} from '../types/parameterSets';

import axios from './axios';

export const createParameterSet = async (request: CreateParameterSet) => {
  const { data } = await axios.post<APIResponse<ParameterSet>>(
    '/parameterSets',
    request
  );
  return data.data;
};

export const getAllParameterSets = async () => {
  const { data } =
    await axios.get<APIResponse<ParameterSet[]>>('/parameterSets');
  return data.data;
};

export const getAllParameterSetsPopulated = async () => {
  const { data } = await axios.get<APIResponse<ParameterSetPopulated[]>>(
    '/parameterSets/populated'
  );
  return data.data;
};

export const getParameterSetsOfType = async (id: string) => {
  const { data } = await axios.get<APIResponse<ParameterSet[]>>(
    `/parameterSets/type/${id}`
  );
  return data.data;
};

export const getParameterSetById = async (id: string) => {
  const { data } = await axios.get<APIResponse<ParameterSet>>(
    `/parameterSets/id/${id}`
  );
  return data.data;
};

export const updateParameterSet = async (request: UpdatedParameterSet) => {
  const { data } = await axios.put<APIResponse<null>>(
    '/parameterSets',
    request
  );
  return data.data === null;
};

export const deleteParameterSet = async (id: string) => {
  const { data } = await axios.delete<APIResponse<null>>(
    `/parameterSets/${id}`
  );
  return data.data === null;
};
