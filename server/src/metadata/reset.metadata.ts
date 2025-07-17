import cron from 'node-cron';

import MetaData from '../models/MetaData.model';

const resetMetaData = () => {
  cron.schedule('0 0 1 1 *', async () => {
    try {
      const metadata = await MetaData.findById('metadata');
      const currentYear = new Date().getFullYear();
      if (!metadata) {
        console.warn('Metadata not found');
        return;
      }
      if (metadata.currentYearInDatabase !== currentYear) {
        await MetaData.findByIdAndUpdate('metadata', {
          $set: {
            currentSoilSampleId: 0,
            currentWaterSampleId: 0,
            currentYearInDatabase: currentYear,
          },
        });
        console.log('Year changed. Sample IDs reset and current year updated');
      }
    } catch (err) {
      console.error('Error reseting metadata');
      throw err;
    }
  });
  console.log('Yearly reset scheduled');
};

export default resetMetaData;
