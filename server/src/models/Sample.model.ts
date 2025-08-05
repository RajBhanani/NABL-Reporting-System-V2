import { Document, model, Schema, Types } from 'mongoose';

export interface ISample extends Document {
  sampleId: number;
  sampleCode: string;
  sampleReceivedOn: Date;
  sampleType: Types.ObjectId;
  sampleDetail: string;
}

const sampleSchema = new Schema<ISample>({
  sampleId: {
    type: Number,
    required: true,
  },
  sampleCode: {
    type: String,
    required: true,
    unique: true,
  },
});

const Sample = model<ISample>('sample', sampleSchema);

export default Sample;
