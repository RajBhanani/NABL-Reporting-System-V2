import { Document, model, Schema } from 'mongoose';

export interface IMetaData extends Document {
  _id: string;
  currentCertificationNumber: number;
  currentRevision: string;
  analysedBy: string;
  approvedBy: string;
}

const metaDataSchema = new Schema<IMetaData>({
  _id: { type: String, required: true, default: 'metadata' },
  currentCertificationNumber: { type: Number, required: true },
  currentRevision: { type: String, required: true, trim: true },
  analysedBy: { type: String, required: true, trim: true },
  approvedBy: { type: String, required: true, trim: true },
});

const MetaData = model<IMetaData>('metadata', metaDataSchema);

export default MetaData;
