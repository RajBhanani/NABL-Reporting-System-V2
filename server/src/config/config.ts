import 'dotenv/config';

interface Config {
  port: number;
  nodeEnv: string;
  clientUrl: string;
  mongoUri: string;
}

export const config: Config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || '',
  mongoUri: process.env.MONGO_URI || '',
};
