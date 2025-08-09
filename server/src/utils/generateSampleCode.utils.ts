const generateSampleCode = (sampleTypeName: string, sampleId: number) => {
  const currentYear = new Date().getFullYear() % 100;
  return `${currentYear}${sampleTypeName.toUpperCase()[0]}${sampleId.toString().padStart(6, '0')}`;
};

export default generateSampleCode;
