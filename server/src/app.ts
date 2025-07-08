import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';

import { config } from './config/config';
import { errorHandler } from './middlewares/error.middleware';
import healthcheckRouter from './routes/healthcheck.route';
import { notFound } from './routes/notFound.routes';

const app = express();

app.use(cors({ origin: config.clientUrl, credentials: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/v2/healthcheck', healthcheckRouter);

app.use(notFound);

app.use(errorHandler);

export { app };
