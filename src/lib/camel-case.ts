interface CamelCaseOptions {
  deep: boolean;
}

export function camelCaseKeys(
  obj: Record<string, unknown>,
  options: CamelCaseOptions,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    // Convert key from snake_case to camelCase
    const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
      letter.toUpperCase(),
    );

    // Handle nested objects if deep option is true
    if (
      options.deep &&
      value &&
      typeof value === 'object' &&
      !Array.isArray(value)
    ) {
      result[camelKey] = camelCaseKeys(
        value as Record<string, unknown>,
        options,
      );
    }
    // Handle arrays if deep option is true
    else if (options.deep && Array.isArray(value)) {
      result[camelKey] = value.map((item) =>
        item && typeof item === 'object'
          ? camelCaseKeys(item as Record<string, unknown>, options)
          : item,
      );
    }
    // Handle primitive values and shallow conversion
    else {
      result[camelKey] = value;
    }
  }

  return result;
}
