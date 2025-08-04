import { Document, model, Schema, Types } from 'mongoose';

export interface IParameter extends Document {
  parameterName: string;
  parameterOfSampleType: Types.ObjectId;
  parameterUnit: string;
  parameterTestMethod: string;
  parameterVariables: string[];
  parameterFormula: string;
}

const parameterSchema: Schema<IParameter> = new Schema({
  parameterName: {
    type: String,
    required: true,
  },
  parameterOfSampleType: {
    type: Schema.Types.ObjectId,
    ref: 'sample_type',
    required: true,
  },
  parameterUnit: {
    type: String,
    trim: true,
    required: true,
  },
  parameterVariables: {
    type: [{ type: String }],
  },
  parameterFormula: {
    type: String,
    trim: true,
  },
  parameterTestMethod: {
    type: String,
    trim: true,
    required: true,
  },
});

const Parameter = model<IParameter>('parameters', parameterSchema);

export default Parameter;
