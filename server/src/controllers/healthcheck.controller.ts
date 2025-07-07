import { Request, Response } from 'express';

import { HttpCodes } from '../types/HttpCodes.enum';
import { APIResponse } from '../utils/APIResponse';

const healthcheck = (_request: Request, response: Response) => {
  response.status(HttpCodes.OK).json(APIResponse.Ok<number>(process.uptime()));
};

export { healthcheck };
