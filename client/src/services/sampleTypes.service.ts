import type { APIResponse } from '../types/api';
import type {
  CreateSampleType,
  SampleType,
  UpdatedSampleType,
} from '../types/sampleTypes';

import axios from './axios';

export const createSampleType = async (request: CreateSampleType) => {
  const { data } = await axios.post<APIResponse<SampleType>>(
    '/sampleTypes',
    request
  );
  return data.data;
};

export const getAllSampleTypes = async () => {
  const { data } = await axios.get<APIResponse<SampleType[]>>('/sampleTypes');
  return data.data;
};

export const getSampleTypeById = async (id: string) => {
  const { data } = await axios.get<APIResponse<SampleType>>(
    `/sampleType/${id}`
  );
  return data.data;
};

export const updatedSampleType = async (request: UpdatedSampleType) => {
  const { data } = await axios.put<APIResponse<null>>('/sampleTypes', request);
  return data.data === null;
};

export const deleteSampleType = async (id: string) => {
  const { data } = await axios.delete<APIResponse<null>>(`/sampleTypes/${id}`);
  return data.data === null;
};
