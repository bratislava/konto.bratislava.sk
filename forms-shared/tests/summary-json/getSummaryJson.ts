import { getExampleFormPairs } from '../../src/example-forms/getExampleFormPairs'
import { getSummaryJsonNode } from '../../src/summary-json/getSummaryJsonNode'

describe('getSummaryJson', () => {
  getExampleFormPairs().forEach(({ formDefinition, exampleForm }) => {
    it(`${exampleForm.name} summary JSON should match snapshot`, () => {
      const result = getSummaryJsonNode(
        formDefinition.schemas.schema,
        formDefinition.schemas.uiSchema,
        exampleForm.formData,
      )
      expect(result).toMatchSnapshot()
    })
  })
})
