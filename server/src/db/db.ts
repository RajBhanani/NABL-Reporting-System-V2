import mongoose from 'mongoose';

import { appConfig } from '../config/appConfig';

const connectToDB = async () => {
  try {
    const connection = await mongoose.connect(appConfig.mongoUri);
    console.log(`Database connected: ${connection.connection.host}`);
  } catch (error) {
    console.error('Error connecting to database', error);
    process.exit(1);
  }
};

export default connectToDB;
