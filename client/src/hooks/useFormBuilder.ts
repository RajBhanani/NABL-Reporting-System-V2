import { useCallback, useMemo, useState, type ChangeEvent } from 'react';

import type { FieldValue, FormInput } from '../types/form';

function useFormBuilder<FieldNames extends string>(
  formData: FormInput<FieldNames>
) {
  const [fields, setFields] = useState(() => {
    return Object.fromEntries(
      Object.entries(formData).map(([key, config]) => {
        const initialValue = (config as FormInput<FieldNames>[FieldNames])
          .initialValue;
        const validators = formData[key as FieldNames].validators;
        let initialErrors: string[] = [];
        if (validators) {
          initialErrors = validators
            .map((validator) => validator(initialValue))
            .filter((err) => err !== null);
        }
        return [
          key,
          {
            value: initialValue,
            errors: initialErrors,
            touched: false,
          },
        ];
      })
    ) as Record<
      FieldNames,
      { value: FieldValue; errors: string[]; touched: boolean }
    >;
  });

  const handleFieldChange = useCallback(
    (fieldName: FieldNames) => (e: ChangeEvent<HTMLInputElement>) => {
      const newValue =
        e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      const validators = formData[fieldName]?.validators;
      let newErrors: string[] = [];
      if (validators) {
        newErrors = validators
          .map((validator) => validator(newValue))
          .filter((err) => err !== null);
      }
      setFields((prev) => {
        return {
          ...prev,
          [fieldName]: {
            value: newValue,
            errors: newErrors,
            touched: true,
          },
        };
      });
    },
    []
  );

  const markAllAsTouched = useCallback(() => {
    Object.keys(fields).forEach((key) => {
      setFields((prev) => {
        return {
          ...prev,
          [key]: {
            ...fields[key as FieldNames],
            touched: true,
          },
        };
      });
    });
  }, [fields]);

  const getValues = useCallback(() => {
    return Object.fromEntries(
      Object.keys(fields).map((key) => [key, fields[key as FieldNames].value])
    ) as Record<FieldNames, FieldValue>;
  }, [fields]);

  const isFormValid = useMemo(() => {
    return Object.keys(fields).every(
      (key) => fields[key as FieldNames].errors.length === 0
    );
  }, [fields]);

  return {
    fields,
    getValues,
    handleFieldChange,
    markAllAsTouched,
    isFormValid,
  };
}

export { useFormBuilder };
