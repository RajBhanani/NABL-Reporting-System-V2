import type { ParameterSetPartial } from './parameterSets';
import type { SampleTypePartial } from './sampleTypes';

export type Sample = {
  _id: string;
  sampleId: number;
  sampleCode: string;
  sampleReceivedOn: string;
  sampleType: string;
  parameterSets: string[];
  requestedBy?: string;
  sampleCondOrQty?: string;
  samplingBy?: string;
  customerName?: string;
  customerAddress?: string;
  customerContactNo?: string;
  customerFarmName?: string;
  surveyNo?: string;
  prevCrop?: string;
  nextCrop?: string;
  isCompleted: boolean;
};

export type SamplePartial = { _id: string } & Partial<Omit<Sample, '_id'>>;

export type SamplePopulated = Omit<Sample, 'sampleType' | 'parameterSets'> & {
  sampleType: SampleTypePartial;
  parameterSets: ParameterSetPartial[];
};

export type CreateSample = {
  sampleType: string;
  parameterSets: string[];
  sampleReceivedOn: string;
  requestedBy?: string;
  sampleCondOrQty?: string;
  samplingBy?: string;
  customerName?: string;
  customerAddress?: string;
  customerContactNo?: string;
  customerFarmName?: string;
  surveyNo?: string;
  prevCrop?: string;
  nextCrop?: string;
};

export type UpdateSample = {
  _id: string;
  requestedBy?: string;
  sampleCondOrQty?: string;
  samplingBy?: string;
  customerName?: string;
  customerAddress?: string;
  customerContactNo?: string;
  customerFarmName?: string;
  surveyNo?: string;
  prevCrop?: string;
  nextCrop?: string;
  isCompleted?: boolean;
};
