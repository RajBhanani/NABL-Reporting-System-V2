import { NextFunction, Request, Response } from 'express';

const asyncHandler =
  (func: (request: Request, response: Response, next: NextFunction) => void) =>
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      await func(request, response, next);
    } catch (error) {
      next(error);
    }
  };

export { asyncHandler };
