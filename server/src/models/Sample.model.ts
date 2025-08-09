import { Document, model, Schema, Types } from 'mongoose';

export interface ISample extends Document {
  sampleId: number;
  sampleCode: string;
  sampleReceivedOn: Date;
  sampleType: Types.ObjectId;
  sampleDetail: string;
  parameterSet: Types.ObjectId[];
  requestedBy: string;
  sampleCondOrQty: string;
  samplingBy: string;
  customerName: string;
  customerAddress: string;
  customerContactNo: string;
  customerFarmName: string;
  surveyNo: number;
  prevCrop: string;
  nextCrop: string;
  isReported: boolean;
}

const sampleSchema = new Schema<ISample>({
  sampleId: {
    type: Number,
    required: true,
  },
  sampleCode: {
    type: String,
    required: true,
  },
  sampleReceivedOn: {
    type: Date,
    required: true,
  },
  sampleType: {
    type: Schema.Types.ObjectId,
    ref: 'sample_type',
    required: true,
  },
  sampleDetail: {
    type: String,
    trim: true,
  },
  parameterSet: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: 'parameter_set',
      },
    ],
    required: true,
  },
  requestedBy: {
    type: String,
    trim: true,
  },
  sampleCondOrQty: {
    type: String,
    trim: true,
  },
  samplingBy: {
    type: String,
    trim: true,
  },
  customerName: {
    type: String,
    trim: true,
  },
  customerAddress: {
    type: String,
    trim: true,
  },
  customerContactNo: {
    type: String,
    maxlength: 10,
    minlength: 10,
    validate: {
      validator: function (num) {
        return /^[0-9]{10}/.test(num);
      },
    },
  },
  customerFarmName: {
    type: String,
    trim: true,
  },
  surveyNo: {
    type: Number,
  },
  prevCrop: {
    type: String,
    trim: true,
  },
  nextCrop: {
    type: String,
    trim: true,
  },
  isReported: {
    type: Boolean,
    required: true,
    default: false,
  },
});

const Sample = model<ISample>('sample', sampleSchema);

export default Sample;
