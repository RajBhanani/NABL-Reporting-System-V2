import { app } from './app';
import { config } from './config/config';
import connectToDB from './db/db';

const startServer = async () => {
  await connectToDB();
  app.listen(config.port, () => {
    console.log(`Server start on port ${config.port}`);
  });
};

startServer();
