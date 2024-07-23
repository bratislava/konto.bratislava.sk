import { formDefinitions } from '../../src/definitions/formDefinitions'
import { fetchSlovenskoSkFormMetadata } from '../../test-utils/fetchSlovenskoSkFormMetadata'
import { isSlovenskoSkFormDefinition } from '../../src/definitions/formDefinitionTypes'
import { baRjsfValidator } from '../../src/form-utils/validators'
import { filterConsole } from '../../test-utils/filterConsole'
import { baGetDefaultFormState } from '../../src/form-utils/defaultFormState'
import { getExampleFormPairs } from '../../src/example-forms/getExampleFormPairs'

describe('Form definitions', () => {
  formDefinitions.forEach((formDefinition) => {
    describe(formDefinition.slug, () => {
      it('schemas matches snapshot', () => {
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

      it('has at least one example form', () => {
        const examples = getExampleFormPairs({
          formDefinitionFilterFn: (formDefinitionInner) =>
            formDefinitionInner.slug === formDefinition.slug,
        })
        expect(examples.length).toBeGreaterThan(0)
      })
    })
  })

  formDefinitions.filter(isSlovenskoSkFormDefinition).forEach((formDefinition) => {
    it(`should match Slovensko.sk data for ${formDefinition.title}`, async () => {
      const metadata = await fetchSlovenskoSkFormMetadata(formDefinition.slovenskoSkUrl)

      expect(metadata['dc:identifier']).toEqual([
        `http://data.gov.sk/doc/eform/${formDefinition.pospID}/${formDefinition.pospVersion}`,
      ])
      // Examine "Martin Pinter" vs "Pinter Martin"
      // expect(metadata['dc:creator']).toEqual([formDefinition.gestor])
      expect(metadata['meta:version']).toEqual([formDefinition.pospVersion])

      // Change in the future when forms with limited date validity are added
      const inForceFromDate = new Date(metadata['meta:inForceFrom'][0])
      expect(inForceFromDate.getTime()).toBeLessThanOrEqual(new Date().getTime())

      // Change in the future when forms with limited date validity are added
      expect(metadata['meta:inForceTo']).toBeUndefined()
    })
  })
})
