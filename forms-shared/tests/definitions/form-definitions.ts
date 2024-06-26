import { formDefinitions } from '../../src/definitions/formDefinitions'
import { fetchSlovenskoSkFormMetadata } from '../../test-utils/fetchSlovenskoSkFormMetadata'
import { isSlovenskoSkFormDefinition } from '../../src/definitions/formDefinitionTypes'

describe('Form definitions', () => {
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
