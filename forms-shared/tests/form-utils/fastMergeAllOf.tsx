import { describe, test, expect } from 'vitest'
import { baFastMergeAllOf } from '../../src/form-utils/fastMergeAllOf'
import { BAJSONSchema7 } from '../../src/form-utils/ajvKeywords'

describe('fastMergeAllOf', () => {
  test('should merge properties from allOf array', () => {
    const schema: BAJSONSchema7 = {
      type: 'object',
      properties: { name: { type: 'string' } },
      allOf: [
        { properties: { age: { type: 'number' } } },
        { properties: { email: { type: 'string' } } },
      ],
    }

    const result = baFastMergeAllOf(schema)

    expect(result).toEqual({
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
        email: { type: 'string' },
      },
      required: [],
    })
  })

  test('should merge required properties from allOf array', () => {
    const schema: BAJSONSchema7 = {
      type: 'object',
      properties: { name: { type: 'string' } },
      required: ['name'],
      allOf: [
        {
          properties: { age: { type: 'number' } },
          required: ['age'],
        },
        {
          properties: { email: { type: 'string' } },
          required: ['email'],
        },
      ],
    }

    const result = baFastMergeAllOf(schema)

    expect(result).toEqual({
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
        email: { type: 'string' },
      },
      required: ['name', 'age', 'email'],
    })
  })

  test('should preserve object references in properties', () => {
    const nameProperty = { type: 'string', minLength: 3 } as const
    const ageProperty = { type: 'number', minimum: 0 } as const

    const schema: BAJSONSchema7 = {
      type: 'object',
      properties: { name: nameProperty },
      allOf: [{ properties: { age: ageProperty } }],
    }

    const result = baFastMergeAllOf(schema)

    expect(result).toEqual({
      type: 'object',
      properties: {
        name: nameProperty,
        age: ageProperty,
      },
      required: [],
    })
    expect(result?.properties?.name).toBe(nameProperty)
    expect(result?.properties?.age).toBe(ageProperty)
  })

  test('should handle schema without allOf', () => {
    const schema: BAJSONSchema7 = {
      type: 'object',
      properties: { name: { type: 'string' } },
      required: ['name'],
    }

    const result = baFastMergeAllOf(schema)

    expect(result).toBe(schema)
  })

  test('should add type: "object" when missing in input schema', () => {
    const schema: BAJSONSchema7 = {
      properties: { name: { type: 'string' } },
      allOf: [{ properties: { age: { type: 'number' } } }],
    }

    const result = baFastMergeAllOf(schema)

    expect(result.type).toBe('object')
    expect(result.properties).toEqual({
      name: { type: 'string' },
      age: { type: 'number' },
    })
  })

  test('should throw error when schema type is not "object"', () => {
    const schema: BAJSONSchema7 = {
      type: 'string',
    }

    expect(() => baFastMergeAllOf(schema)).toThrow(
      'Schema type must be either undefined or "object"',
    )
  })

  test('should throw error when allOf item type is not "object"', () => {
    const schema: BAJSONSchema7 = {
      type: 'object',
      properties: { name: { type: 'string' } },
      allOf: [
        {
          type: 'string',
        },
      ],
    }

    expect(() => baFastMergeAllOf(schema)).toThrow(
      'allOf item type must be either undefined or "object"',
    )
  })

  test('should throw error when allOf item contains unsupported properties', () => {
    const schema: BAJSONSchema7 = {
      type: 'object',
      properties: { name: { type: 'string' } },
      allOf: [
        {
          properties: { age: { type: 'number' } },
          additionalProperties: false,
        },
      ],
    }

    expect(() => baFastMergeAllOf(schema)).toThrow(
      'Unsupported properties in allOf item: additionalProperties',
    )
  })

  test('should throw error when allOf item is not defined', () => {
    const schema: BAJSONSchema7 = {
      type: 'object',
      properties: { name: { type: 'string' } },
      allOf: [undefined] as any,
    }

    expect(() => baFastMergeAllOf(schema)).toThrow('allOf item must be an object')
  })

  test('should throw error when schema is not an object', () => {
    const schema = 'not an object' as any

    expect(() => baFastMergeAllOf(schema)).toThrow('Schema must be an object')
  })
})
