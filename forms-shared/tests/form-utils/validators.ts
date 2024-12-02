import { getExampleFormPairs } from '../../src/example-forms/getExampleFormPairs'
import { testValidatorRegistry } from '../../test-utils/validatorRegistry'

describe('Validators', () => {
  getExampleFormPairs().forEach(({ formDefinition, exampleForm }) => {
    it(`${exampleForm.name} validate correctly`, () => {
      const validator = testValidatorRegistry.getValidator(formDefinition.schemas.schema)
      expect(
        validator.isValid(
          formDefinition.schemas.schema,
          exampleForm.formData,
          formDefinition.schemas.schema,
        ),
      ).toBe(true)
    })
  })
})
