// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createCondition = (value: [string[], any][]) => {
  const result = {
    type: 'object',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    properties: {} as Record<string, any>,
    required: [] as string[],
  }

  value.forEach(([path, value]) => {
    let currentLevel = result
    path.forEach((key, index) => {
      if (!currentLevel.properties[key]) {
        currentLevel.properties[key] = {
          type: 'object',
          properties: {},
          required: [],
        }
        currentLevel.required.push(key)
      }
      if (index === path.length - 1) {
        currentLevel.properties[key] =
          typeof value === 'object' && value !== null && !Array.isArray(value)
            ? { ...value }
            : value
      } else {
        currentLevel = currentLevel.properties[key]
      }
    })
  })

  // Merge properties and required arrays
  Object.keys(result.properties).forEach((key) => {
    const prop = result.properties[key]
    if (prop.type === 'object') {
      prop.required = Array.from(new Set([...prop.required, ...Object.keys(prop.properties)]))
    }
  })

  return result
}
