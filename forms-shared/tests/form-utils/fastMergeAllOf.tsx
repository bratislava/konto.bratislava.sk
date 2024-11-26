import { baFastMergeAllOf } from '../../src/form-utils/fastMergeAllOf'
import { BAJSONSchema7 } from '../../src/form-utils/ajvKeywords'

describe('fastMergeAllOf', () => {
  it('should merge properties from allOf array', () => {
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

  it('should merge required properties from allOf array', () => {
    const schema: BAJSONSchema7 = {
      type: 'object',
      properties: { name: { type: 'string' } },
      required: ['name'],
      allOf: [
        { 
          properties: { age: { type: 'number' } },
          required: ['age']
        },
        { 
          properties: { email: { type: 'string' } },
          required: ['email']
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
      required: ['name', 'age', 'email']
    })
  })

  it('should preserve object references in properties', () => {
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

  it('should handle schema without allOf', () => {
    const schema: BAJSONSchema7 = {
      type: 'object',
      properties: { name: { type: 'string' } },
      required: ['name'],
    }

    const result = baFastMergeAllOf(schema)

    expect(result).toBe(schema)
  })

  it('should add type: "object" when missing in input schema', () => {
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
})
