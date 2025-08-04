import { Document, model, Schema } from 'mongoose';

export interface ISampleType extends Document {
  sampleTypeName: string;
  sampleTypeCurrentSampleId: number;
}

const sampleTypeSchema: Schema<ISampleType> = new Schema({
  sampleTypeName: { type: String, required: true, unique: true },
  sampleTypeCurrentSampleId: { type: Number, default: 0 },
});

const SampleType = model<ISampleType>('sample_type', sampleTypeSchema);

export default SampleType;
