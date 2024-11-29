import { ROOT_SCHEMA_PREFIX } from '@rjsf/utils'
import { BAJSONSchema7 } from '../../src/form-utils/ajvKeywords'
import {
  createSingleUseValidatorRegistry,
  createWeakMapRegistry,
} from '../../src/form-utils/validatorRegistry'
import Ajv from 'ajv'

describe('Validator Registry', () => {
  let addSchemaSpy: jest.SpyInstance<Ajv, Parameters<typeof Ajv.prototype.addSchema>>

  beforeEach(() => {
    addSchemaSpy = jest.spyOn(Ajv.prototype, 'addSchema')
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
    it('should create new validator instance for each call', () => {
      const registry = createSingleUseValidatorRegistry()

      const validator1 = registry.getValidator(mockSchema1)
      const validator2 = registry.getValidator(mockSchema2)
      const validator3 = registry.getValidator(mockSchema1)

      expect(validator1).not.toBe(validator2)
      expect(validator2).not.toBe(validator3)
      expect(validator1).not.toBe(validator3)
    })

    it('should compile schema for each validation', () => {
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

  describe('WeakMapRegistry', () => {
    it('should cache validator instances', () => {
      const registry = createWeakMapRegistry()

      const validator1 = registry.getValidator(mockSchema1)
      const validator2 = registry.getValidator(mockSchema2)
      const validator3 = registry.getValidator(mockSchema1)

      expect(validator1).toBe(validator3)
      expect(validator2).not.toBe(validator3)
    })

    it('should compile schema only once per unique schema', () => {
      const registry = createWeakMapRegistry()

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
  })
})
