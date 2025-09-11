/* eslint-disable @typescript-eslint/no-explicit-any */

export type ValidatorFn<T> = (value: T) => string | null;

export type FieldConfig<T> = {
  initialValue: T;
  validators?: ValidatorFn<T>[];
};

export type BaseFieldState<T> = {
  value: T;
  errors: string[];
  touched: boolean;
};

export type FieldState<T> = BaseFieldState<T> & {
  set: (newValue: T) => void;
  update: (updateFn: (prevValue: T) => T) => void;
  reset: () => void;
};

export type FormInput<TFields extends Record<string, FieldConfig<any>>> = {
  [K in keyof TFields]: TFields[K];
};
