import { formDefinitions } from '../../src/definitions/formDefinitions'
import { FormDefinition } from '../../src/definitions/formDefinitionTypes'
import { filterConsole } from '../../test-utils/filterConsole'
import { baGetDefaultFormState } from '../../src/form-utils/defaultFormState'
import { getExampleFormPairs } from '../../src/example-forms/getExampleFormPairs'
import { testValidatorRegistry } from '../../test-utils/validatorRegistry'

describe('Form definitions', () => {
  formDefinitions.forEach((formDefinition) => {
    describe(formDefinition.slug, () => {
      it('schema matches snapshot', () => {
        expect(formDefinition.schema).toMatchSnapshot()
      })

      it('is valid schema', () => {
        const validator = testValidatorRegistry.getValidator(formDefinition.schema)
        expect(validator.ajv.validateSchema(formDefinition.schema, true)).toBe(true)
      })

      it('default form state should match snapshot', () => {
        filterConsole(
          'warn',
          (message) =>
            typeof message === 'string' && message.includes('could not merge subschemas in allOf'),
        )

        expect(
          baGetDefaultFormState(formDefinition.schema, {}, testValidatorRegistry),
        ).toMatchSnapshot()
      })

      it('for selected forms, has at least one example form', () => {
        const examples = getExampleFormPairs({
          formDefinitionFilterFn: (formDefinitionInner): formDefinitionInner is FormDefinition =>
            formDefinitionInner.slug === formDefinition.slug,
        })
        if (!(formDefinition.slug.startsWith('tsb-') || formDefinition.slug.endsWith('-test'))) {
          expect(examples.length).toBeGreaterThan(0)
        }
      })
    })
  })
})
