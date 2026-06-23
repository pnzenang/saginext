export function getSelectFilterValues(values: Iterable<unknown>) {
  const flattenedValues = Array.from(values).flatMap(value => (Array.isArray(value) ? value : [value]))

  return Array.from(
    new Set(
      flattenedValues
        .filter(value => value !== null && value !== undefined)
        .map(value => String(value).trim())
        .filter(Boolean)
    )
  ).sort()
}
