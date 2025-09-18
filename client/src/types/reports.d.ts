import type { ParameterSetPartial } from './parameterSets';
import type { SamplePartial } from './samples';

type TestData =
  | { parameter: string; value: string }
  | { parameter: string; data: Record<string, string> };

export type Report = {
  _id: string;
  sampleId: string;
  ulr: string;
  parameterSet: string;
  testResults: { paramater: string; value: string }[];
  isAuthorised: boolean;
  analysisStartedOn: Date;
  analysisEndedOn: Date;
};

export type ReportPopulated = Omit<
  Report,
  'sampleId' | 'parameterSet' | 'testResults'
> & {
  sampleId: SamplePartial;
  parameterSet: ParameterSetPartial;
  testResults: {
    parameter: {
      _id: string;
      name: string;
      unit: string;
      testMethod: string;
    };
    value: string;
  }[];
};

export type CreateReport = {
  sampleId: string;
  parameterSetSubDocId: string;
  untypedTestData: TestData[];
  analysisStartedOn: Date;
  analysisEndedOn: Date;
};

export type UpdateReportData = {
  _id: string;
  untypedTestData: TestData[];
};
