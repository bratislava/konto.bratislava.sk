import type { RJSFSchema } from '@rjsf/utils'
import camelCase from 'lodash/camelCase'

type ObjectJsonSchema = {
  type: 'object'
  properties: Record<string, ObjectJsonSchema | ArrayJsonSchema | RJSFSchema>
  required: string[]
}
type ArrayJsonSchema = { type: 'array'; items: ObjectJsonSchema }

const arrayPrefix = 'array:'

/**
 * Create a condition object from a list of paths and values.
 *
 * Most of the conditions in JSON Schema are repetitive and require a lot of boilerplate. This
 * function simplifies the process by creating a condition object from a list of paths and values
 * and expecting the whole tree to be required.
 *
 * @example
 * createCondition([
 *  [['a', 'b'], { const: 'value1' }],
 *  [['a', 'c'], { const: 'value2' }],
 *  [['x', 'array:y', 'z'], { const: 'value3' }],
 * ])
 *
 * // Outputs:
 * {
 *   type: 'object',
 *   properties: {
 *     a: {
 *       type: 'object',
 *       properties: {
 *         b: { const: 'value1' },
 *         c: { const: 'value2' },
 *       },
 *       required: ['b', 'c'],
 *     },
 *     x: {
 *       type: 'object',
 *       properties: {
 *         y: {
 *           type: 'array',
 *           items: {
 *             type: 'object',
 *             properties: {
 *               z: { const: 'value3' },
 *             },
 *             required: ['z'],
 *           },
 *         },
 *       },
 *       required: ['y'],
 *     },
 *   },
 *   required: ['a', 'x'],
 * }
 */
export const createCondition = (conditions: [string[], RJSFSchema][]) => {
  const result: ObjectJsonSchema = {
    type: 'object',
    properties: {},
    required: [],
  }
  const ownObjects: (ObjectJsonSchema | ArrayJsonSchema)[] = [result]

  conditions.forEach(([path, value]) => {
    let currentLevel = result
    path.forEach((keyWithPrefix, index) => {
      if (!ownObjects.includes(currentLevel)) {
        // This function expects a strict schema to be followed, so if previous path is created by user, it's an error
        // to try to write to it.
        throw new Error(
          `Condition path cannot be written to user created object at "${path
            .slice(0, index)
            .join('.')}"`,
        )
      }

      const isArrayKey = keyWithPrefix.startsWith(arrayPrefix)
      const key = isArrayKey ? keyWithPrefix.slice(arrayPrefix.length) : keyWithPrefix

      if (index === path.length - 1) {
        if (!currentLevel.required.includes(key)) {
          currentLevel.required.push(key)
        }

        currentLevel.properties[key] = value
        return
      }

      if (!currentLevel.properties[key]) {
        const newObject = {
          type: 'object',
          properties: {},
          required: [],
        } as ObjectJsonSchema
        ownObjects.push(newObject)

        currentLevel.properties[key] = isArrayKey
          ? ({ type: 'array', items: newObject } as ArrayJsonSchema)
          : newObject
        currentLevel.required.push(key)
      }

      const nextLevel = currentLevel.properties[key]

      if (isArrayKey) {
        if (nextLevel.type !== 'array') {
          throw new Error(
            `A non-array path already exists at "${path.slice(0, index + 1).join('.')}"`,
          )
        }
        currentLevel = nextLevel.items as ObjectJsonSchema
      } else {
        if (nextLevel.type !== 'object') {
          throw new Error(
            `A non-object path already exists at "${path.slice(0, index + 1).join('.')}"`,
          )
        }
        currentLevel = nextLevel as ObjectJsonSchema
      }
    })
  })

  return result as RJSFSchema
}

const assertUniqueOptions = (options: { value: string }[]) => {
  const uniqueValues = new Set(options.map((option) => option.value))
  if (uniqueValues.size !== options.length) {
    throw new Error('Options must have unique values')
  }
}

/**
 * Create options from a list of strings. For example:
 * ['Option 1', 'Option 2'] => [{ value: 'Option 1', title: 'Option 1', isDefault: true }, ...]
 */
export const createStringOptions = (options: string[], addDefault = true) => {
  const result = options.map((option, index) => ({
    value: option,
    title: option,
    isDefault: index === 0 && addDefault ? true : undefined,
  }))

  assertUniqueOptions(result)
  return result
}

/**
 * Create options with camelCase value from a list of strings. For example:
 * ['Option 1', 'Option 2'] => [{ value: 'option1', title: 'Option 1', isDefault: true }, ...]
 */
export const createCamelCaseOptions = (options: string[], addDefault = true) => {
  const result = options.map((option, index) => ({
    value: camelCase(option),
    title: option,
    isDefault: index === 0 && addDefault ? true : undefined,
  }))

  assertUniqueOptions(result)
  return result
}

/**
 * Create options with camelCase value from a list of objects. For example:
 * [{ title: 'Option 1' }, { title: 'Option 2' }] => [{ value: 'option1', title: 'Option 1', isDefault: true }, ...]
 */
export const createCamelCaseOptionsV2 = <Option extends { title: string }>(
  options: Option[],
  addDefault = true,
) => {
  const result = options.map((option, index) => ({
    value: camelCase(option.title),
    ...option,
    isDefault: index === 0 && addDefault ? true : undefined,
  }))

  assertUniqueOptions(result)
  return result
}

/**
 * All generated schemas must not have `undefined` values in objects, RJSF relies on checks like `'oneOf' in schema`
 * which returns `true` for `{ oneOf: undefined }`.
 */
export const removeUndefinedValues = <T>(obj: T) => {
  return JSON.parse(JSON.stringify(obj)) as T
}
