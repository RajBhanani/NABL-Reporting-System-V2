export type SampleType = {
  _id: string;
  name: string;
  currentSampleId: number;
};

export type SampleTypePartial = { _id: string } & Partial<
  Omit<SampleType, '_id'>
>;

export type CreateSampleType = {
  name: string;
};

export type UpdatedSampleType = {
  _id: string;
  name?: string;
  currentSampleId?: number;
};
