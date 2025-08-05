import { Document, model, Schema } from 'mongoose';

export interface ISampleType extends Document {
  name: string;
  currentSampleId: number;
}

const sampleTypeSchema: Schema<ISampleType> = new Schema({
  name: { type: String, required: true, unique: true },
  currentSampleId: { type: Number, default: 0 },
});

const SampleType = model<ISampleType>('sample_type', sampleTypeSchema);

export default SampleType;
