// Key order in package.json is irrelevant, so compare structurally.
function canonicalize(value) {
  if (Array.isArray(value)) {
    return value.map(canonicalize)
  }

  if (value === null || typeof value !== 'object') {
    return value
  }

  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, canonicalize(value[key])]),
  )
}

export function isDeepEqual(actual, expected) {
  return JSON.stringify(canonicalize(actual)) === JSON.stringify(canonicalize(expected))
}
