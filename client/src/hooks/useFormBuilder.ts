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
  const [currentInput, setCurrentInput] = useState(formInput);

  const buildBaseFields = useCallback((input: FormInput<TFields>) => {
    const initialEntries = Object.entries(input).map(([key, config]) => {
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
  }, []);

  // Fields without setter and updater functions, used for storing and updating values
  const [baseFields, setBaseFields] = useState(() =>
    buildBaseFields(formInput)
  );

  const reinitialiseForm = useCallback(
    (newInput: FormInput<TFields>) => {
      setCurrentInput(newInput);
      setBaseFields(buildBaseFields(newInput));
    },
    [buildBaseFields]
  );

  // Helper function to avoid code repetition
  const applyValue = useCallback(
    <K extends keyof TFields>(
      fieldName: K,
      newValue: TFields[K]['initialValue']
    ) => {
      const { validators } = currentInput[fieldName];
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
    [currentInput]
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
            prevFormValue: TFields[typeof key]['initialValue']
          ) => TFields[typeof key]['initialValue']
        ) => {
          setBaseFields((prev) => {
            const prevValue = prev[key].value;
            const newValue = updateFn(prevValue);
            const { validators } = formInput[key];
            const errors =
              validators
                ?.map((v) => v(newValue))
                .filter((err): err is string => err !== null) ?? [];
            return {
              ...prev,
              [key]: { ...prev[key], value: newValue, errors, touched: true },
            };
          });
        };
        const reset = () => {
          const { initialValue, validators } = currentInput[key];
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

  return {
    fields,
    getValues,
    isFormValid,
    markAllAsTouched,
    resetForm,
    reinitialiseForm,
  };
}
