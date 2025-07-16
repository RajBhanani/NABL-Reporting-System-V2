import { NextFunction, Request, Response } from 'express';

import { HttpCodes } from '../types/enums/HttpCodes.enum';
import { APIError } from '../utils/APIError.utils';

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
