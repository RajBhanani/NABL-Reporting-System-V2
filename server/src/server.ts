import { app } from './app';
import { appConfig } from './config/appConfig';
import connectToDB from './db/db';

const startServer = async () => {
  await connectToDB();
  app.listen(appConfig.port, () => {
    console.log(`Server start on port ${appConfig.port}`);
  });
};

startServer();
