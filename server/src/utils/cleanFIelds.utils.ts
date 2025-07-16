const cleanFields = <T extends Record<string, unknown>>(obj: T): T =>
  Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key,
      typeof value === 'string'
        ? value.trim() || undefined
        : (value ?? undefined),
    ])
  ) as T;

export default cleanFields;
