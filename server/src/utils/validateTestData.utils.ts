import { TestDataWithoutValue } from '../types/interfaces/TestDataWithoutValue.interface';
import { TestDataWithValue } from '../types/interfaces/TestDataWithValue.interface';
import { APIError } from './APIError.utils';

const validateTestData = (
  arr: unknown[]
): (TestDataWithoutValue | TestDataWithValue)[] => {
  const res: (TestDataWithoutValue | TestDataWithValue)[] = [];
  for (const obj of arr) {
    if (
      obj &&
      typeof obj === 'object' &&
      'parameter' in obj &&
      typeof obj.parameter === 'string'
    ) {
      const hasData =
        'data' in obj &&
        obj.data &&
        typeof obj.data === 'object' &&
        !Array.isArray(obj.data);
      const hasValue =
        'value' in obj && obj.value && typeof obj.value === 'string';
      if (hasData && !hasValue) res.push(obj as TestDataWithoutValue);
      else if (hasValue && !hasData) res.push(obj as TestDataWithValue);
      else throw APIError.BadRequest('Invalid structure');
    } else throw APIError.BadRequest('Invalid structure');
  }
  return res;
};

export default validateTestData;
