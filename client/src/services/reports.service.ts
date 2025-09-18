import type { APIResponse } from '../types/api';
import type {
  CreateReport,
  Report,
  ReportPopulated,
  UpdateReportData,
} from '../types/reports';

import axios from './axios';

export const createReportFromSample = async (request: CreateReport) => {
  const { data } = await axios.post<APIResponse<Report>>('/reports', request);
  return data.data;
};

export const getAllReports = async () => {
  const { data } = await axios.get<APIResponse<Report[]>>('/reports');
  return data.data;
};

export const getReportsOfType = async (id: string) => {
  const { data } = await axios.get<APIResponse<Report[]>>(
    `/reports/type/${id}`
  );
  return data.data;
};

export const getReportById = async (id: string) => {
  const { data } = await axios.get<APIResponse<ReportPopulated>>(
    `/reports/id/${id}`
  );
  return data.data;
};

export const updateReportData = async (request: UpdateReportData) => {
  const { data } = await axios.put<APIResponse<void>>('/reports', request);
  return data.data;
};

export const authoriseReport = async (id: string) => {
  const { data } = await axios.put<APIResponse<void>>('/reports/authorise', {
    _id: id,
  });
  return data.data;
};
