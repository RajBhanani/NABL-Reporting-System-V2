import { Document, model, Schema, Types } from 'mongoose';

export interface ReportResult {
  parameter: Types.ObjectId;
  value: string;
}

export interface IReport extends Document {
  sampleId: Types.ObjectId;
  ulr: string;
  parameterSet: Types.ObjectId;
  testResults: ReportResult[];
  isAuthorised: boolean;
  analysisStartedOn: Date;
  analysisEndedOn: Date;
}

const reportSchema = new Schema<IReport>({
  sampleId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'sample',
  },
  ulr: {
    type: String,
    required: true,
  },
  parameterSet: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'parameter_set',
  },
  testResults: {
    type: [
      {
        parameter: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: 'parameter',
        },
        value: { type: String },
      },
    ],
    required: true,
    validate: {
      validator: function (arr: ReportResult[]) {
        return arr.length > 0;
      },
    },
  },
  isAuthorised: {
    type: Boolean,
    default: false,
  },
  analysisStartedOn: {
    type: Date,
    default: Date.now,
  },
  analysisEndedOn: {
    type: Date,
    default: Date.now,
  },
});

const Report = model<IReport>('report', reportSchema);

export default Report;
