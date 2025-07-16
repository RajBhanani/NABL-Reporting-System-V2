import 'dotenv/config';

interface Config {
  port: number;
  nodeEnv: string;
  clientUrl: string;
  mongoUri: string;
  jwtAccessSecret: string;
  jwtRefreshSecret: string;
  jwtAccessExpiresIn: string;
  jwtRefreshExpiresIn: string;
}

export const appConfig: Config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || '',
  mongoUri: process.env.MONGO_URI || '',
  jwtAccessSecret:
    process.env.JWT_ACCESS_SECRET || 'fallback_access_secret_nabl_sumitomo',
  jwtRefreshSecret:
    process.env.JWT_REFRESH_SECRET || 'nabl_sumitomo_fallback_refresh_secret',
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
};
