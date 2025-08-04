import { Request, Response } from 'express';

import { HttpCodes } from '../types/enums/HttpCodes.enum';
import { APIResponse } from '../utils/APIResponse.utils';
import { asyncHandler } from '../utils/asyncHandler.utils';

const healthcheck = asyncHandler(
  async (_request: Request, response: Response) => {
    return response
      .status(HttpCodes.Ok)
      .json(APIResponse.Ok<number>(process.uptime()));
  }
);

export { healthcheck };
