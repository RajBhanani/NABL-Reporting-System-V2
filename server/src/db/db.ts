import mongoose from 'mongoose';

import { config } from '../config/config';

const connectToDB = async () => {
  try {
    const connection = await mongoose.connect(config.mongoUri);
    console.log(`Database connected: ${connection.connection.host}`);
  } catch (error) {
    console.error('Error connecting to database', error);
    process.exit(1);
  }
};

export default connectToDB;
