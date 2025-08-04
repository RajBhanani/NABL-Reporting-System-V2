import { APIError } from './APIError.utils';

const validateDefined = (
  fields: Record<string, unknown>,
  customMessage?: string
) => {
  const missing = Object.entries(fields)
    .filter(
      ([, value]) => value === undefined || value === null || value === ''
    )
    .map(([key]) => key);

  if (missing.length > 0)
    throw APIError.BadRequest(
      customMessage || `Missing fields: ${missing.join(', ')}`
    );
};

export default validateDefined;
