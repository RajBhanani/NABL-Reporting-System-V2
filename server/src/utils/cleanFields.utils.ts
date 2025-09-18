const cleanFields = <T extends Record<string, unknown>>(obj: T): T =>
  Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key,
      typeof value === 'string'
        ? value.trim() || undefined
        : Array.isArray(value) && value.length === 0
          ? undefined
          : (value ?? undefined),
    ])
  ) as T;

export default cleanFields;
