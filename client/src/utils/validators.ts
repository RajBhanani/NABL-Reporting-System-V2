import type { FieldValue, ValidatorFn } from '../types/form';

export const required: ValidatorFn<FieldValue> = (value: FieldValue) => {
  if (typeof value === 'boolean')
    return value ? null : 'This field is required';
  if (typeof value === 'string')
    return !value.trim() ? 'This field is required' : null;
  return null;
};

export const email: ValidatorFn<FieldValue> = (value: FieldValue) => {
  if (typeof value === 'string')
    return /\S+@\S+\.\S+/.test(value) ? null : 'Invalid email';
  return null;
};

export const minLength =
  (len: number): ValidatorFn<FieldValue> =>
  (value) => {
    if (typeof value === 'string')
      return value.length < len ? `Must be at least ${len} characters` : null;
    return null;
  };

export const maxLength =
  (len: number): ValidatorFn<FieldValue> =>
  (value) => {
    if (typeof value === 'string')
      return value.length > len ? `Must be at most ${len} characters` : null;
    return null;
  };
