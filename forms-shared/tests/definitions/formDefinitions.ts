import { formDefinitions } from '../../src/definitions/formDefinitions'
import { FormDefinition } from '../../src/definitions/formDefinitionTypes'
import { filterConsole } from '../../test-utils/filterConsole'
import { baGetDefaultFormState } from '../../src/form-utils/defaultFormState'
import { getExampleFormPairs } from '../../src/example-forms/getExampleFormPairs'
import { testValidatorRegistry } from '../../test-utils/validatorRegistry'
import { describe, test, expect } from 'vitest'

describe('Form definitions', () => {
  formDefinitions.forEach((formDefinition) => {
    describe(formDefinition.slug, () => {
      test('schema matches snapshot', () => {
        expect(formDefinition.schema).toMatchSnapshot()
      })

      test('is valid schema', () => {
        const validator = testValidatorRegistry.getValidator(formDefinition.schema)
        expect(validator.ajv.validateSchema(formDefinition.schema, true)).toBe(true)
      })

      test('default form state should match snapshot', () => {
        filterConsole(
          'warn',
          (message) =>
            typeof message === 'string' && message.includes('could not merge subschemas in allOf'),
        )

        expect(
          baGetDefaultFormState(formDefinition.schema, {}, testValidatorRegistry),
        ).toMatchSnapshot()
      })

      if (!formDefinition.exampleFormNotRequired) {
        test('for forms with required example, has at least one example form', () => {
          const examples = getExampleFormPairs({
            formDefinitionFilterFn: (formDefinitionInner): formDefinitionInner is FormDefinition =>
              formDefinitionInner.slug === formDefinition.slug,
          })
          expect(examples.length).toBeGreaterThan(0)
        })
      }
    })
  })
})
