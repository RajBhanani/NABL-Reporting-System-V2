import { app } from './app';
import { appConfig } from './config/appConfig';
import connectToDB from './db/db';
import initMetaData from './metadata/init.metadata';
import resetMetaData from './metadata/reset.metadata';

const startServer = async () => {
  try {
    await connectToDB();
    await initMetaData();
    resetMetaData();
    app.listen(appConfig.port, () => {
      console.log(`Server start on port ${appConfig.port}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

startServer();
