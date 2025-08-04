import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';

import { appConfig } from './config/appConfig';
import { errorHandler } from './middlewares/error.middleware';
import authRouter from './routes/auth.routes';
import healthcheckRouter from './routes/healthcheck.routes';
import { notFound } from './routes/notFound.routes';
import parameterRouter from './routes/parameter.routes';
import sampleTypeRouter from './routes/sampleType.routes';

const app = express();

app.use(cors({ origin: appConfig.clientUrl, credentials: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/v2/healthcheck', healthcheckRouter);
app.use('/api/v2/auth', authRouter);
app.use('/api/v2/sampleTypes', sampleTypeRouter);
app.use('/api/v2/parameters', parameterRouter);

app.use(notFound);

app.use(errorHandler);

export { app };
