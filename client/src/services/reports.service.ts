import type { APIResponse } from '../types/api';
import type { CreateReport, Report } from '../types/reports';

import axios from './axios';

export const createReportFromSample = async (request: CreateReport) => {
  const { data } = await axios.post<APIResponse<Report>>('/reports', request);
  return data.data;
};
