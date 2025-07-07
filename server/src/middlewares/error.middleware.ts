import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';

import { ErrorTypes } from '../types/ErrorTypes.enum';
import { APIError } from '../utils/APIError';

/* eslint-disable */
const errorHandler = (
  error: any,
  _request: Request,
  response: Response,
  _next: NextFunction
) => {
  /* eslint-enable */
  let errorResponse = error;
  if (!(errorResponse instanceof APIError)) {
    const status =
      errorResponse.status ??
      (errorResponse instanceof mongoose.Error ? 400 : 500);
    const type = errorResponse.type ?? ErrorTypes.Internal;
    const message = errorResponse.message ?? 'Something went wrong';
    const errors = errorResponse.errors ?? [];
    const stack = errorResponse.stack ?? '';
    errorResponse = new APIError(status, type, message, errors, stack);
  }
  response.status(errorResponse.status).json(errorResponse);
};

export { errorHandler };
