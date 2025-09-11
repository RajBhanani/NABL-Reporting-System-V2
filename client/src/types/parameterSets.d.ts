import type { ParameterPartial } from './parameters';
import type { SampleTypePartial } from './sampleTypes';

export type ParameterSet = {
  _id: string;
  name: string;
  sampleType: string;
  parameters: string[];
  isPartial: boolean;
};

export type ParameterSetPartial = { _id: string } & Partial<
  Omit<ParameterSet, '_id'>
>;

export type ParameterSetPopulated = Omit<
  ParameterSet,
  'sampleType' | 'parameters'
> & { sampleType: SampleTypePartial; parameters: ParameterPartial[] };

export type CreateParameterSet = {
  name: string;
  sampleType: string;
  parameters: string[];
  isParial: boolean;
};

export type UpdateParameterSet = {
  _id: string;
  name?: string;
  parameters?: string[];
  isPartial?: boolean;
};
