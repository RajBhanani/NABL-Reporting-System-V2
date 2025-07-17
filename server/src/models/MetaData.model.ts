import { Document, model, Schema } from 'mongoose';

export interface IMetaData extends Document {
  _id: string;
  currentYearInDatabase: number;
  currentSoilSampleId: number;
  currentWaterSampleId: number;
  currentSoilParameterId: number;
  currentWaterParameterId: number;
  currentCertificationNumber: number;
  currentRevision: string;
  analysedBy: string;
  approvedBy: string;
}

const metaDataSchema = new Schema<IMetaData>({
  _id: { type: String, required: true, default: 'metadata' },
  currentYearInDatabase: {
    type: Number,
    required: true,
    default: new Date().getFullYear(),
  },
  currentSoilSampleId: { type: Number, required: true, default: 0 },
  currentWaterSampleId: { type: Number, required: true, default: 0 },
  currentSoilParameterId: { type: Number, required: true, default: 0 },
  currentWaterParameterId: { type: Number, required: true, default: 0 },
  currentCertificationNumber: { type: Number, required: true },
  currentRevision: { type: String, required: true, trim: true },
  analysedBy: { type: String, required: true, trim: true },
  approvedBy: { type: String, required: true, trim: true },
});

const MetaData = model<IMetaData>('metadata', metaDataSchema);

export default MetaData;
