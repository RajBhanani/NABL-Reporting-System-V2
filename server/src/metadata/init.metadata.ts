import MetaData from '../models/MetaData.model';

const initMetaData = async () => {
  try {
    await MetaData.findByIdAndUpdate(
      'metadata',
      {
        $setOnInsert: {
          currentYearInDatabase: new Date().getFullYear(),
          currentSoilSampleId: 0,
          currentWaterSampleId: 0,
          currentSoilParameterId: 0,
          currentWaterParameterId: 0,
          currentCertificationNumber: 7275,
          currentRevision: '01',
          analysedBy: 'Mr. L. Analyst',
          approvedBy: 'Mr. L. Admin',
        },
      },
      { upsert: true }
    );
    console.log('Metadata initiated');
  } catch (error) {
    console.error('Error initialising metadata');
    throw error;
  }
};

export default initMetaData;
