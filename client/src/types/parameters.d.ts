import type { ParameterSetPartial } from './parameterSets';

export type Parameter = {
  _id: string;
  name: string;
  sampleType: string;
  unit: string;
  testMethod: string;
  variables: string[];
  formula: string;
};

export type ParameterPartial = { _id: string } & Partial<
  Omit<Parameter, '_id'>
>;

export type ParameterPopulated = Omit<Parameter, 'sampleType'> &
  ParameterSetPartial;

export type CreateParameter = {
  name: string;
  sampleType: string;
  unit: string;
  testMethod: string;
  variables: string[];
  formula: string;
};

export type UpdateParameter = {
  _id: string;
  name?: string;
  unit?: string;
  testMethod?: string;
  variables?: string[];
  formula?: string;
};
