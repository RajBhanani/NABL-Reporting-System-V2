import jwt from 'jsonwebtoken';

import { appConfig } from '../config/appConfig';
import { AccessTokenPayload } from '../types/interfaces/AccessTokenPayload.interface';

const generateAccessToken = (payload: AccessTokenPayload) => {
  return jwt.sign(payload, appConfig.jwtAccessSecret, {
    expiresIn: appConfig.jwtAccessExpiresIn,
  } as jwt.SignOptions);
};

const generateRefreshToken = (id: string) => {
  return jwt.sign({ id }, appConfig.jwtRefreshSecret, {
    expiresIn: appConfig.jwtRefreshExpiresIn,
  } as jwt.SignOptions);
};

const verifyAccessToken = (token: string) =>
  jwt.verify(token, appConfig.jwtAccessSecret);
const verifyRefreshToken = (token: string) =>
  jwt.verify(token, appConfig.jwtRefreshSecret);

export {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
