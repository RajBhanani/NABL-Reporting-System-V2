import type { APIResponse } from '../types/api';
import type {
  CreateSample,
  Sample,
  SamplePopulated,
  UpdateSample,
} from '../types/samples';

import axios from './axios';

export const createSample = async (request: CreateSample) => {
  const { data } = await axios.post<APIResponse<Sample>>('/samples', request);
  return data.data;
};

export const getAllSamples = async () => {
  const { data } = await axios.get<APIResponse<Sample[]>>('/samples');
  return data.data;
};

export const getAllSamplesPopulated = async () => {
  const { data } =
    await axios.get<APIResponse<SamplePopulated[]>>('/samples/populated');
  return data.data;
};

export const getSampleById = async (id: string) => {
  const { data } = await axios.get<APIResponse<SamplePopulated>>(
    `/samples/id/${id}`
  );
  return data.data;
};

export const updateSample = async (request: UpdateSample) => {
  const { data } = await axios.put<APIResponse<null>>('/samples', request);
  return data.data;
};
