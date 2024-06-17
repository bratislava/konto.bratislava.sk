import { formDefinitions } from '../../src/definitions/form-definitions'
import { isSlovenskoSkFormDefinition } from '../../src/definitions/form-definitions-helpers'
import { fetchSlovenskoSkFormMetadata } from '../../test-utils/fetchSlovenskoSkFormMetadata'

describe('Form definitions', () => {
  formDefinitions.filter(isSlovenskoSkFormDefinition).forEach((formDefinition) => {
    it(`should match Slovensko.sk data for ${formDefinition.title}`, async () => {
      const slovenskoSkMetadata = await fetchSlovenskoSkFormMetadata(formDefinition.slovenskoSkUrl)

      expect(slovenskoSkMetadata['meta:metadata']['dc:identifier']).toEqual([
        `http://data.gov.sk/doc/eform/${formDefinition.pospID}/${formDefinition.pospVersion}`,
      ])
      // Examine "Martin Pinter" vs "Pinter Martin"
      // expect(slovenskoSkMetadata['meta:metadata']['dc:creator']).toEqual([formDefinition.gestor])
      expect(slovenskoSkMetadata['meta:metadata']['meta:version']).toEqual([
        formDefinition.pospVersion,
      ])

      // Change in the future when forms with limited date validity are added
      const inForceFromDate = new Date(slovenskoSkMetadata['meta:metadata']['meta:inForceFrom'][0])
      expect(inForceFromDate.getTime()).toBeLessThanOrEqual(new Date().getTime())

      // Change in the future when forms with limited date validity are added
      expect(slovenskoSkMetadata['meta:metadata']['meta:inForceTo']).toBeUndefined()
    })
  })
})
