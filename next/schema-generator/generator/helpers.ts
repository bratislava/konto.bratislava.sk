/* eslint-disable import/no-extraneous-dependencies */
import type { RJSFSchema } from '@rjsf/utils'
import camelCase from 'lodash/camelCase'

type ConditionObject<T> = { type: 'object'; properties: Record<string, T>; required: string[] }

/**
 * Create a condition object from a list of paths and values
 *
 * Example input: [
 *  [['a', 'b'], { const: 'value1' }],
 *  [['a', 'c'], { const: 'value2' }],
 * ]
 *
 * Example output:
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
 *   },
 *   required: ['a'],
 * }
 */
export const createCondition = <T>(value: [string[], T][]) => {
  const result = {
    type: 'object',
    properties: {} as Record<string, T | ConditionObject<T>>,
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
        currentLevel = currentLevel.properties[key] as ConditionObject<T>
      }
    })
  })

  // Merge properties and required arrays
  Object.keys(result.properties).forEach((key) => {
    const prop = result.properties[key]
    if (prop && typeof prop === 'object' && 'type' in prop && prop.type === 'object') {
      prop.required = Array.from(new Set([...prop.required, ...Object.keys(prop.properties)]))
    }
  })

  return result as RJSFSchema
}

/**
 * Create options from a list of strings. For example:
 * ['Option 1', 'Option 2'] => [{ value: 'Option 1', title: 'Option 1', isDefault: true }, ...]
 */
export const createStringOptions = (options: string[], addDefault = true) =>
  options.map((option, index) => ({
    value: option,
    title: option,
    isDefault: index === 0 && addDefault ? true : undefined,
  }))

/**
 * Create options with camelCase value from a list of strings. For example:
 * ['Option 1', 'Option 2'] => [{ value: 'option1', title: 'Option 1', isDefault: true }, ...]
 */
export const createCamelCaseOptions = (options: string[], addDefault = true) =>
  options.map((option, index) => ({
    value: camelCase(option),
    title: option,
    isDefault: index === 0 && addDefault ? true : undefined,
  }))

/**
 * Create options with camelCase value from a list of objects. For example:
 * [{ title: 'Option 1' }, { title: 'Option 2' }] => [{ value: 'option1', title: 'Option 1', isDefault: true }, ...]
 */
export const createCamelCaseOptionsV2 = <Option extends { title: string }>(
  options: Option[],
  addDefault = true,
) =>
  options.map((option, index) => ({
    value: camelCase(option.title),
    ...option,
    isDefault: index === 0 && addDefault ? true : undefined,
  }))
