import { describe, expect, test } from 'vitest'
import { getExampleFormPairs } from '../../src/example-forms/getExampleFormPairs'
import { testValidatorRegistry } from '../../test-utils/validatorRegistry'

describe('Validators', () => {
  getExampleFormPairs().forEach(({ formDefinition, exampleForm }) => {
    test(`${exampleForm.name} validate correctly`, () => {
      const validator = testValidatorRegistry.getValidator(formDefinition.schema)
      const { errors } = validator.validateFormData(exampleForm.formData, formDefinition.schema)

      if (errors.length > 0) {
        throw new Error(`Validation errors: ${JSON.stringify(errors, null, 2)}`)
      }

      expect(errors).toHaveLength(0)
    })
  })
})
