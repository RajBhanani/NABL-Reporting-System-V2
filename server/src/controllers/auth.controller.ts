import { CookieOptions, NextFunction, Request, Response } from 'express';

import { appConfig } from '../config/appConfig';
import User from '../models/User.model';
import { ErrorTypes } from '../types/enums/ErrorTypes.enum';
import { HttpCodes } from '../types/enums/HttpCodes.enum';
import { AccessTokenPayload } from '../types/interfaces/AccessTokenPayload.interface';
import { APIError } from '../utils/APIError.utils';
import { APIResponse } from '../utils/APIResponse.utils';
import { asyncHandler } from '../utils/asyncHandler.utils';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/auth.utils';
import cleanFields from '../utils/cleanFields.utils';
import convertToMiliseconds from '../utils/convertToMiliseconds.utils';
import validateDefined from '../utils/validateDefined.utils';

const register = asyncHandler(
  async (request: Request, response: Response, _next: NextFunction) => {
    const { username, password, name, email, role } = cleanFields(request.body);

    validateDefined({ username, password, name, email, role });

    const existingUser = await User.findOne({ username });
    if (existingUser) throw APIError.Conflict('Username is already taken');

    const user = await User.create({ username, password, name, email, role });

    return response.status(HttpCodes.Created).json(APIResponse.Created(user));
  }
);

const login = asyncHandler(
  async (request: Request, response: Response, _next: NextFunction) => {
    const { username, password } = cleanFields(request.body);
    validateDefined({ username, password });
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password)))
      throw APIError.Unauthorized('Invalid credentials');

    const accessToken = generateAccessToken({
      id: user._id,
      role: user.role,
    } as AccessTokenPayload);
    const refreshToken = generateRefreshToken(user._id as string);

    user.refreshToken = refreshToken;
    await user.save();

    response.cookie('refreshToken', {
      httpOnly: true,
      secure: appConfig.nodeEnv === 'production',
      sameSite: appConfig.nodeEnv === 'production' ? 'none' : 'strict',
      maxAge: convertToMiliseconds(appConfig.jwtRefreshExpiresIn),
    } as CookieOptions);

    return response.status(HttpCodes.Ok).json(APIResponse.Ok(accessToken));
  }
);

const refreshToken = asyncHandler(
  async (request: Request, response: Response, next: NextFunction) => {
    const token = request.cookies?.refreshToken;
    if (!token) throw APIError.Unauthorized('Session expired. Log in again');

    try {
      const decoded = verifyRefreshToken(token) as { id: string };
      const user = await User.findById(decoded.id);
      if (!user || user.refreshToken !== token)
        throw APIError.Unauthorized('Invalid refresh token. Log in again');

      const newAccessToken = generateAccessToken({
        id: user._id,
        role: user.role,
      } as AccessTokenPayload);
      return response.status(HttpCodes.Ok).json(APIResponse.Ok(newAccessToken));
    } catch (error) {
      return next(
        new APIError(
          HttpCodes.Unauthorized,
          ErrorTypes.Authentication,
          'Error in refreshing tokens',
          [error as string]
        )
      );
    }
  }
);

export { register, login, refreshToken };
