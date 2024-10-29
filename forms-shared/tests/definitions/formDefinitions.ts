import { formDefinitions } from '../../src/definitions/formDefinitions'
import { FormDefinition } from '../../src/definitions/formDefinitionTypes'
import { baRjsfValidator } from '../../src/form-utils/validators'
import { filterConsole } from '../../test-utils/filterConsole'
import { baGetDefaultFormState } from '../../src/form-utils/defaultFormState'
import { getExampleFormPairs } from '../../src/example-forms/getExampleFormPairs'

describe('Form definitions', () => {
  formDefinitions.forEach((formDefinition) => {
    describe(formDefinition.slug, () => {
      it('schemas match snapshot', () => {
        expect(formDefinition.schemas).toMatchSnapshot()
      })

      it('is valid schema', () => {
        expect(baRjsfValidator.ajv.validateSchema(formDefinition.schemas.schema, true)).toBe(true)
      })

      it('default form state should match snapshot', () => {
        filterConsole(
          'warn',
          (message) =>
            typeof message === 'string' && message.includes('could not merge subschemas in allOf'),
        )

        expect(baGetDefaultFormState(formDefinition.schemas.schema, {})).toMatchSnapshot()
      })

      it('for selected forms, has at least one example form', () => {
        const examples = getExampleFormPairs({
          formDefinitionFilterFn: (formDefinitionInner): formDefinitionInner is FormDefinition =>
            formDefinitionInner.slug === formDefinition.slug,
        })
        if (!formDefinition.slug.startsWith('tsb-')) {
          expect(examples.length).toBeGreaterThan(0)
        }
      })
    })
  })
})
