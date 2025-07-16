const convertToMiliseconds = (time: string) => {
  const value = Number(time.replace(/\D/g, ''));
  const unit = time.replace(/\d/g, '');
  let ms = 0;
  switch (unit) {
    case 's':
    case 'sec':
      ms = value * 1000;
      break;

    case 'm':
    case 'min':
      ms = value * 60 * 1000;
      break;

    case 'h':
    case 'hr':
      ms = value * 60 * 60 * 1000;
      break;

    case 'd':
      ms = value * 24 * 60 * 60 * 1000;
      break;

    default:
      break;
  }
  return ms;
};

export default convertToMiliseconds;
