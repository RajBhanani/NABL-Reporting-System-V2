import { Document, model, Schema, Types } from 'mongoose';

export interface IParameter extends Document {
  name: string;
  sampleType: Types.ObjectId;
  unit: string;
  testMethod: string;
  variables: string[];
  formula: string;
}

const parameterSchema: Schema<IParameter> = new Schema({
  name: {
    type: String,
    required: true,
  },
  sampleType: {
    type: Schema.Types.ObjectId,
    ref: 'sample_type',
    required: true,
  },
  unit: {
    type: String,
    trim: true,
    required: true,
  },
  testMethod: {
    type: String,
    trim: true,
    required: true,
  },
  variables: {
    type: [{ type: String }],
  },
  formula: {
    type: String,
    trim: true,
  },
});

const Parameter = model<IParameter>('parameters', parameterSchema);

export default Parameter;
