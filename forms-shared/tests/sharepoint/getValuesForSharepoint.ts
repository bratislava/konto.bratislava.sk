import { getExampleFormPairs } from '../../src/example-forms/getExampleFormPairs'
import { getValuesForFields } from '../../src/sharepoint/getValuesForSharepoint'
import { getSummaryJsonNode } from '../../src/summary-json/getSummaryJsonNode'

describe('getValuesForFields', () => {
  // TODO use only those which have sharepoint
  getExampleFormPairs().forEach(({ formDefinition, exampleForm }) => {
    it(`${exampleForm.name} values for fields should match snapshot`, () => {
      const result = getValuesForFields(
        formDefinition.sharepointData,
        {
          ginisDocumentId: 'ginisId',
          formDefinitionSlug: 'slugTest',
          title: 'formTitle',
        },
        exampleForm.formData,
        {}, // TODO
        {},
      )
      expect(result).toMatchSnapshot()
    })
  })
})
