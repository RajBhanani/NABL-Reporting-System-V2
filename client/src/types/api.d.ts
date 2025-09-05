export interface APIResponse<T> {
  status: number;
  data: T;
  message: string;
}

export interface APIError {
  status: number;
  type: string;
  errors: string[];
  message: string;
}
