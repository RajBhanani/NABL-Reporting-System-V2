import { Document, model, Schema, Types } from 'mongoose';

export interface IParameterSet extends Document {
  name: string;
  sampleType: Types.ObjectId;
  parameters: Types.ObjectId[];
  isPartial: boolean;
}

const parameterSetSchema = new Schema<IParameterSet>({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  sampleType: {
    type: Schema.Types.ObjectId,
    ref: 'sample_type',
    required: true,
  },
  parameters: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: 'parameter',
      },
    ],
    required: true,
  },
  isPartial: {
    type: Boolean,
    default: false,
  },
});

const ParameterSet = model<IParameterSet>('parameter_set', parameterSetSchema);

export default ParameterSet;
