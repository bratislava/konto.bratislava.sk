import { getExampleFormPairs } from '../../src/example-forms/getExampleFormPairs'
import { testValidatorRegistry } from '../../test-utils/validatorRegistry'

describe('Validators', () => {
  getExampleFormPairs().forEach(({ formDefinition, exampleForm }) => {
    it(`${exampleForm.name} validate correctly`, () => {
      const validator = testValidatorRegistry.getValidator(formDefinition.schema)
      expect(
        validator.isValid(formDefinition.schema, exampleForm.formData, formDefinition.schema),
      ).toBe(true)
    })
  })
})
