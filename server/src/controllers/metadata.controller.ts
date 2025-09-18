import { NextFunction, Request, Response } from 'express';

import MetaData from '../models/MetaData.model';
import { HttpCodes } from '../types/enums/HttpCodes.enum';
import { APIError } from '../utils/APIError.utils';
import { APIResponse } from '../utils/APIResponse.utils';
import { asyncHandler } from '../utils/asyncHandler.utils';

const getMetaData = asyncHandler(
  async (_request: Request, response: Response, next: NextFunction) => {
    try {
      const metadata = await MetaData.find().select('-__v -_id');
      return response.status(HttpCodes.Ok).json(APIResponse.Ok(metadata[0]));
    } catch (error) {
      next(error);
    }
  }
);

const updateMetaData = asyncHandler(
  async (_request: Request, _response: Response, next: NextFunction) => {
    try {
      throw APIError.InternalServerError('Not Implemented');
    } catch (error) {
      next(error);
    }
  }
);

export { getMetaData, updateMetaData };
