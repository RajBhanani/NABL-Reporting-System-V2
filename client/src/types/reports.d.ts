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

export type CreateReport = {
  sampleId: string;
  parameterSetSubDocId: string;
  untypedTestData: (
    | { parameter: string; value: string }
    | { parameter: string; data: Record<string, string> }
  )[];
  analysisStartedOn: Date;
  analysisEndedOn: Date;
};
