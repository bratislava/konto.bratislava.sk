import { ROOT_SCHEMA_PREFIX } from '@rjsf/utils'
import { Ajv } from 'ajv'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { BAJSONSchema7 } from '../../src/form-utils/ajvKeywords'
import {
  createCachedValidatorRegistry,
  createSingleUseValidatorRegistry,
} from '../../src/form-utils/validatorRegistry'

describe('Validator Registry', () => {
  let addSchemaSpy = vi.spyOn(Ajv.prototype, 'addSchema')

  beforeEach(() => {
    addSchemaSpy = vi.spyOn(Ajv.prototype, 'addSchema')
  })

  afterEach(() => {
    addSchemaSpy.mockRestore()
  })

  const mockSchema1: BAJSONSchema7 = { type: 'object', properties: {} }
  const mockSchema2: BAJSONSchema7 = { type: 'object', properties: { foo: { type: 'string' } } }

  // `addSchema` is called 3 times for each schema, but we want to filter out only the calls from RJSF `handleSchemaUpdate`,
  // which provide `ROOT_SCHEMA_PREFIX` as second argument
  const getHandleSchemaUpdateCalls = () =>
    addSchemaSpy.mock.calls.filter(([, key]) => key === ROOT_SCHEMA_PREFIX)

  describe('SingleUseValidatorRegistry', () => {
    test('should create new validator instance for each call', () => {
      const registry = createSingleUseValidatorRegistry()

      const validator1 = registry.getValidator(mockSchema1)
      const validator2 = registry.getValidator(mockSchema2)
      const validator3 = registry.getValidator(mockSchema1)

      expect(validator1).not.toBe(validator2)
      expect(validator2).not.toBe(validator3)
      expect(validator1).not.toBe(validator3)
    })

    test('should compile schema for each validation', () => {
      const registry = createSingleUseValidatorRegistry()

      // First schema validation
      const validator1 = registry.getValidator(mockSchema1)
      validator1.isValid(mockSchema1, {}, mockSchema1)
      expect(getHandleSchemaUpdateCalls()).toHaveLength(1)

      // Different schema validation
      const validator2 = registry.getValidator(mockSchema2)
      validator2.isValid(mockSchema2, {}, mockSchema2)
      expect(getHandleSchemaUpdateCalls()).toHaveLength(2)

      // Back to first schema
      const validator3 = registry.getValidator(mockSchema1)
      validator3.isValid(mockSchema1, {}, mockSchema1)
      // Should compile schema again
      expect(getHandleSchemaUpdateCalls()).toHaveLength(3)
    })
  })

  describe('CachedValidatorRegistry', () => {
    test('should cache validator instances', () => {
      const registry = createCachedValidatorRegistry()

      const validator1 = registry.getValidator(mockSchema1)
      const validator2 = registry.getValidator(mockSchema2)
      const validator3 = registry.getValidator(mockSchema1)

      expect(validator1).toBe(validator3)
      expect(validator2).not.toBe(validator3)
    })

    test('should compile schema only once per unique schema', () => {
      const registry = createCachedValidatorRegistry()

      // First schema validation
      const validator1 = registry.getValidator(mockSchema1)
      validator1.isValid(mockSchema1, {}, mockSchema1)
      expect(getHandleSchemaUpdateCalls()).toHaveLength(1)

      // Different schema validation
      const validator2 = registry.getValidator(mockSchema2)
      validator2.isValid(mockSchema2, {}, mockSchema2)
      expect(getHandleSchemaUpdateCalls()).toHaveLength(2)

      // Back to first schema
      const validator3 = registry.getValidator(mockSchema1)
      validator3.isValid(mockSchema1, {}, mockSchema1)
      // Should reuse already compiled schema
      expect(getHandleSchemaUpdateCalls()).toHaveLength(2)
    })

    test('should reuse validator for a different schema object with the same content', () => {
      const registry = createCachedValidatorRegistry()

      const validator1 = registry.getValidator(mockSchema2)
      validator1.isValid(mockSchema2, {}, mockSchema2)
      expect(getHandleSchemaUpdateCalls()).toHaveLength(1)

      // e.g. a conditional step evaluated again by `retrieveSchema`
      const sameContentSchema = structuredClone(mockSchema2)
      const validator2 = registry.getValidator(sameContentSchema)
      validator2.isValid(sameContentSchema, {}, sameContentSchema)

      expect(validator2).toBe(validator1)
      // Should reuse already compiled schema
      expect(getHandleSchemaUpdateCalls()).toHaveLength(1)
    })

    test('should keep only the most recently used schema contents', () => {
      const registry = createCachedValidatorRegistry(2)
      const mockSchema3: BAJSONSchema7 = { type: 'object', properties: { bar: { type: 'number' } } }

      const validator1 = registry.getValidator(mockSchema1)
      const validator2 = registry.getValidator(mockSchema2)
      // Marks the content of `mockSchema1` as the most recently used
      expect(registry.getValidator(structuredClone(mockSchema1))).toBe(validator1)
      // Evicts the content of `mockSchema2`
      registry.getValidator(mockSchema3)

      expect(registry.getValidator(structuredClone(mockSchema1))).toBe(validator1)
      expect(registry.getValidator(structuredClone(mockSchema2))).not.toBe(validator2)
      // Schema objects that were already seen are still cached by reference
      expect(registry.getValidator(mockSchema2)).toBe(validator2)
    })
  })
})
