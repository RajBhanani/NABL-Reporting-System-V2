import type { APIResponse } from '../types/api';
import type { MetaData, UpdateMetaData } from '../types/metadata';

import axios from './axios';

export const getMetaData = async () => {
  const { data } = await axios.get<APIResponse<MetaData>>('/metadata');
  return data.data;
};

export const updateMetaData = async (request: UpdateMetaData) => {
  const { data } = await axios.put<APIResponse<void>>('/metadata', request);
  return data.data;
};
