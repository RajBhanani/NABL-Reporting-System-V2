import { NextFunction, Request, Response } from 'express';

import { HttpCodes } from '../types/HttpCodes.enum';
import { APIError } from '../utils/APIError';

const notFound = (
  _request: Request,
  response: Response,
  _next: NextFunction
) => {
  response
    .status(HttpCodes.NotFound)
    .json(APIError.NotFound('Route not found'));
};

export { notFound };
