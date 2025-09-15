import type { ValidatorFn } from '../types/form';

export const required: ValidatorFn<unknown> = (value: unknown) => {
  if (typeof value === 'boolean')
    return value ? null : 'This field is required';
  if (typeof value === 'string')
    return !value.trim() ? 'This field is required' : null;
  return 'Invalid type';
};

export const email: ValidatorFn<unknown> = (value: unknown) => {
  if (typeof value === 'string')
    return /\S+@\S+\.\S+/.test(value) ? null : 'Invalid email';
  return 'Invalid type';
};

export const minLength =
  (len: number): ValidatorFn<unknown> =>
  (value) => {
    if (typeof value === 'string')
      return value.length < len ? `Must be at least ${len} characters` : null;
    return 'Invalid type';
  };

export const maxLength =
  (len: number): ValidatorFn<unknown> =>
  (value) => {
    if (typeof value === 'string')
      return value.length > len ? `Must be at most ${len} characters` : null;
    return 'Invalid type';
  };

export const isDigit: ValidatorFn<unknown> = (value: unknown) => {
  if (typeof value === 'string')
    return /^\d+$/.test(value) ? null : 'Only digits allowed';
  return 'Invalid type';
};

export const isValidNumber: ValidatorFn<unknown> = (value: unknown) => {
  if (typeof value === 'string')
    return /^\d+(\.\d+)?$/.test(value) ? null : 'Enter a valid number';
  return 'Invalid type';
};

export const isValidNumberOrEmptyString: ValidatorFn<unknown> = (
  value: unknown
) => {
  if (typeof value === 'string')
    return /^(?:\d+(?:\.\d+)?|)$/.test(value) ? null : 'Enter a valid number';
  return 'Invalid type';
};
