export type FieldValue = string | boolean;

export type ValidatorFn<FieldValue> = (value: FieldValue) => string | null;

export type FormInput<FormField> = Record<
  FormField,
  { initialValue: FieldValue; validators: ValidatorFn<FieldValue>[] }
>;
