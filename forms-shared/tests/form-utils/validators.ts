import { getExampleFormPairs } from '../../src/example-forms/getExampleFormPairs'
import { baRjsfValidator } from '../../src/form-utils/validators'

describe('Validators', () => {
  getExampleFormPairs().forEach(({ formDefinition, exampleForm }) => {
    it(`${exampleForm.name} validate correctly`, () => {
      expect(
        baRjsfValidator.isValid(
          formDefinition.schemas.schema,
          exampleForm.formData,
          formDefinition.schemas.schema,
        ),
      ).toBe(true)
    })
  })
})
