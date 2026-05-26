import { formDefinitions } from '../../src/definitions/formDefinitions'
import { FormDefinition } from '../../src/definitions/formDefinitionTypes'
import { filterConsole } from '../../test-utils/filterConsole'
import { baGetDefaultFormState } from '../../src/form-utils/defaultFormState'
import { getExampleFormPairs } from '../../src/example-forms/getExampleFormPairs'
import { testValidatorRegistry } from '../../test-utils/validatorRegistry'
import { describe, test, expect } from 'vitest'
import { isValidVersion } from '../../src/versioning/version-compare'
import { collectSchemaFileSlots } from '../../src/form-files/collectSchemaFileSlots'

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

      test('has valid jsonVersion', () => {
        expect(isValidVersion(formDefinition.jsonVersion)).toBe(true)
      })

      test('default form state should match snapshot', () => {
        const restore = filterConsole(
          'warn',
          (message) =>
            typeof message === 'string' && message.includes('could not merge subschemas in allOf'),
        )

        expect(
          baGetDefaultFormState(formDefinition.schema, {}, testValidatorRegistry),
        ).toMatchSnapshot()

        restore()
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

      test('every ui:slot in schema is declared in files.slots', () => {
        const schemaSlots = collectSchemaFileSlots(formDefinition.schema)
        if (schemaSlots.length === 0) {
          return
        }

        expect(
          formDefinition.files,
          'schema has file fields with ui:slot but form definition has no files config',
        ).toBeDefined()

        const declaredSlots = new Set(formDefinition.files!.slots.map((slot) => slot.slotId))
        const undeclared = schemaSlots.filter((slotId) => !declaredSlots.has(slotId))
        expect(undeclared, `schema references slots not declared in files.slots`).toEqual([])
      })
    })
  })
})
