export type MetaData = {
  analysedBy: string;
  approvedBy: string;
  currentCertificationNumber: number;
  currentRevision: string;
};

export type UpdateMetaData = Partial<MetaData>;
