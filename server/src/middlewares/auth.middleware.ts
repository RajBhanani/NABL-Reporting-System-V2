import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { appConfig } from '../config/appConfig';
import { APIError } from '../utils/APIError.utils';
import { asyncHandler } from '../utils/asyncHandler.utils';

const authenticate = asyncHandler(
  async (request: Request, _response: Response, next: NextFunction) => {
    const authHeader = request.headers?.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
      throw APIError.Unauthorised('Missing or malformed token');
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(
      token,
      appConfig.jwtAccessSecret
    ) as jwt.JwtPayload;
    request.user = {
      id: decoded.id,
      role: decoded.role,
    };
    return next();
  }
);

export default authenticate;
