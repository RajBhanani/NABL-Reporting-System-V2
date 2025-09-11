import type { APIResponse } from '../types/api';
import type { CreateSample, Sample } from '../types/samples';

import axios from './axios';

export const createSample = async (request: CreateSample) => {
  const { data } = await axios.post<APIResponse<Sample>>('/samples', request);
  return data.data;
};

export const getAllSamples = async () => {
  const { data } = await axios.get<APIResponse<Sample[]>>('/samples');
  return data.data;
};
