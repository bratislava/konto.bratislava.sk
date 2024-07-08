import { Test, TestingModule } from '@nestjs/testing'

import ThrowerErrorGuard from '../../utils/guards/thrower-error.guard'
import { JsonSchema } from '../../utils/types/global'
import JsonXmlConvertService from './json-xml.convert.service'

describe('JsonXmlConvertService', () => {
  let service: JsonXmlConvertService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JsonXmlConvertService, ThrowerErrorGuard],
    }).compile()
    service = module.get<JsonXmlConvertService>(JsonXmlConvertService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('firstCharToUpper', () => {
    it('should return empty string', () => {
      expect(service['firstCharToUpper']()).toBe('')
      expect(service['firstCharToUpper']('')).toBe('')
    })

    it('should put first char to upper', () => {
      const input = 'test Of FUNCTION'
      const expected = 'Test Of FUNCTION'

      expect(service['firstCharToUpper'](input)).toBe(expected)
    })

    it('should have no problems with utf-8', () => {
      const input = 'čičmany'
      const expected = 'Čičmany'

      expect(service['firstCharToUpper'](input)).toBe(expected)
    })
  })

  describe('getFormatFromItems', () => {
    it('should return undefined', () => {
      expect(service['getFormatFromItems']()).toBeUndefined() // undefined
      expect(service['getFormatFromItems'](true)).toBeUndefined() // is true
      expect(service['getFormatFromItems'](false)).toBeUndefined() // is false
      expect(
        service['getFormatFromItems']([
          { test: { test2: 'test3' } } as unknown as JsonSchema,
        ]),
      ).toBeUndefined() // is array
    })

    it('should return format', () => {
      const jsonSchema = { something: 'something', format: 'formatValue' }
      expect(service['getFormatFromItems'](jsonSchema)).toBe('formatValue')
    })
  })

  describe('getAllPossibleJsonSchemaProperties', () => {
    it('should return empty object', () => {
      expect(service['getAllPossibleJsonSchemaProperties']()).toEqual({})
      expect(service['getAllPossibleJsonSchemaProperties'](true)).toEqual({})
      expect(service['getAllPossibleJsonSchemaProperties'](false)).toEqual({})
    })

    it('should return all properties', () => {
      const schema: JsonSchema = {
        properties: {
          prop1: true,
          propToOverride: true,
          prop2: {
            properties: {
              propInner: true,
            },
          },
        },
        if: true,
        else: {
          properties: {
            propElse: true,
          },
        },
        // eslint-disable-next-line unicorn/no-thenable
        then: {
          properties: {
            propThen: true,
          },
        },
        allOf: [
          {
            properties: {
              propAllOf1: true,
            },
          },
          {
            properties: {
              propAllOf2: true,
            },
          },
        ],
        oneOf: [
          {
            properties: {
              propOneOf1: true,
            },
          },
          {
            properties: {
              propOneOf2: true,
            },
          },
        ],
        anyOf: [
          {
            properties: {
              propAnyOf1: true,
            },
          },
          {
            properties: {
              propAnyOf2: true,
            },
          },
          {
            properties: {
              propToOverride: {
                properties: {
                  propOverridden: true,
                },
              },
            },
          },
        ],
      }

      const result = service['getAllPossibleJsonSchemaProperties'](schema)

      expect(result).toEqual({
        prop1: true,
        prop2: {
          properties: {
            propInner: true,
          },
        },
        propElse: true,
        propThen: true,
        propAllOf1: true,
        propAllOf2: true,
        propAnyOf1: true,
        propAnyOf2: true,
        propOneOf1: true,
        propOneOf2: true,
        propToOverride: {
          properties: {
            propOverridden: true,
          },
        },
      })
    })
  })

  describe('buildXmlRecursive', () => {
    it.todo('maybe refactor and write unit tests')
  })

  describe('getJsonSchemaNodeAtPath', () => {
    const schema: JsonSchema = {
      properties: {
        prop1: {
          if: true,
        },
        prop2: {
          properties: {
            else: true,
            prop3: {
              properties: {
                prop4: true,
              },
              if: false,
              // eslint-disable-next-line unicorn/no-thenable
              then: false,
            },
          },
        },
      },
      if: true,
    }

    it('should return null', () => {
      expect(
        service['getJsonSchemaNodeAtPath'](schema, ['prop1', 'prop3']),
      ).toBeNull()
    })

    it('should return original for empty path', () => {
      expect(service['getJsonSchemaNodeAtPath'](schema, [])).toEqual(schema)
    })

    it('should return json schema', () => {
      const expected = {
        properties: {
          prop4: true,
        },
        if: false,
        // eslint-disable-next-line unicorn/no-thenable
        then: false,
      }

      expect(
        service['getJsonSchemaNodeAtPath'](schema, ['prop2', 'prop3']),
      ).toEqual(expected)
    })
  })

  describe('removeNeedlessXmlTransformArraysRecursive', () => {
    it.todo('maybe refactor and write unit tests')
  })
})
