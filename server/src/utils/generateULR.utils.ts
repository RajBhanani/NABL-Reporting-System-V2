const generateULR = (certiNo: number, sampleId: number, isPartial: boolean) => {
  const yearDigits = new Date().getFullYear() % 100;
  const lastLetter = isPartial ? 'P' : 'F';
  return `TC${certiNo}${yearDigits}0${sampleId.toString().padStart(8, '0')}${lastLetter}`;
};

export default generateULR;
