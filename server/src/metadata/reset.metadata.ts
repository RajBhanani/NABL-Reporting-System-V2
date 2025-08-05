import cron from 'node-cron';

import SampleType from '../models/SampleType.model';

const resetMetaData = () => {
  cron.schedule('0 0 1 1 *', async () => {
    try {
      await SampleType.updateMany(
        {},
        {
          $set: {
            sampleTypeCurrentSampleId: 0,
          },
        }
      );
      console.log('Year changed. Sample IDs reset');
    } catch (err) {
      console.error('Error reseting metadata');
      throw err;
    }
  });
  console.log('Yearly reset scheduled');
};

export default resetMetaData;
