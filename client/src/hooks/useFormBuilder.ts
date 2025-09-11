/* eslint-disable  @typescript-eslint/no-explicit-any */

import { useCallback, useMemo, useState } from 'react';

import type {
  BaseFieldState,
  FieldConfig,
  FieldState,
  FormInput,
} from '../types/form';

export function useFormBuilder<
  TFields extends Record<string, FieldConfig<any>>,
>(formInput: FormInput<TFields>) {
  // Fields without setter and updater functions, used for storing and updating values
  const [baseFields, setBaseFields] = useState(() => {
    const initialEntries = Object.entries(formInput).map(([key, config]) => {
      const { initialValue, validators } = config as FieldConfig<any>;
      let errors: string[] = [];
      if (validators) {
        errors = validators
          .map((validator) => validator(initialValue))
          .filter((error) => error !== null);
      }
      return [key, { value: initialValue, errors, touched: false }];
    });
    const initialFields = Object.fromEntries(initialEntries) as {
      [K in keyof TFields]: BaseFieldState<TFields[K]['initialValue']>;
    };
    return initialFields;
  });

  // Helper function to avoid code repetition
  const applyValue = useCallback(
    <K extends keyof TFields>(
      fieldName: K,
      newValue: TFields[K]['initialValue']
    ) => {
      const { validators } = formInput[fieldName];
      const errors =
        validators
          ?.map((validator) => validator(newValue))
          .filter((err): err is string => err !== null) ?? [];
      setBaseFields((prev) => ({
        ...prev,
        [fieldName]: {
          ...prev[fieldName],
          value: newValue,
          errors,
          touched: true,
        },
      }));
    },
    [formInput]
  );

  // Fields with setter and updater functions
  const fields = useMemo(() => {
    return Object.fromEntries(
      (Object.keys(baseFields) as (keyof TFields)[]).map((key) => {
        const base = baseFields[key];
        const set = (newValue: TFields[typeof key]['initialValue']) => {
          applyValue(key, newValue);
        };
        const update = (
          updateFn: (
            prevValue: TFields[typeof key]['initialValue']
          ) => TFields[typeof key]['initialValue']
        ) => {
          set(updateFn(base.value));
        };
        const reset = () => {
          const { initialValue, validators } = formInput[key];
          const errors =
            validators
              ?.map((validator) => validator(initialValue))
              .filter((err): err is string => err !== null) ?? [];
          setBaseFields((prev) => ({
            ...prev,
            [key]: {
              ...prev[key],
              value: initialValue,
              errors,
              touched: false,
            },
          }));
        };
        return [key, { ...base, set, update, reset }];
      })
    ) as {
      [K in keyof TFields]: FieldState<TFields[K]['initialValue']>;
    };
  }, [baseFields, applyValue]);

  // Utility function to get key-value pairs
  const getValues = useCallback(() => {
    return Object.fromEntries(
      Object.entries(baseFields).map(([key, values]) => {
        return [key, values.value];
      })
    );
  }, [baseFields]);

  const isFormValid = useMemo(() => {
    return Object.values(baseFields).every(
      (field) => field.errors.length === 0
    );
  }, [baseFields]);

  const markAllAsTouched = () => {
    setBaseFields(
      (prev) =>
        Object.fromEntries(
          Object.entries(prev).map(([key, value]) => {
            return [key, { ...value, touched: true }];
          })
        ) as typeof prev
    );
  };

  const resetForm = () => {
    Object.keys(fields).forEach((key) => {
      fields[key].reset();
    });
  };

  return { fields, getValues, isFormValid, markAllAsTouched, resetForm };
}
