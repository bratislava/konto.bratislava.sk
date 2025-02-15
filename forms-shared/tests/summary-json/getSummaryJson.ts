import { describe, expect, test } from 'vitest'
import { getExampleFormPairs } from '../../src/example-forms/getExampleFormPairs'
import { getSummaryJsonNode } from '../../src/summary-json/getSummaryJsonNode'
import { testValidatorRegistry } from '../../test-utils/validatorRegistry'

describe('getSummaryJson', () => {
  getExampleFormPairs().forEach(({ formDefinition, exampleForm }) => {
    test(`${exampleForm.name} summary JSON should match snapshot`, () => {
      const result = getSummaryJsonNode({
        schema: formDefinition.schema,
        formData: exampleForm.formData,
        validatorRegistry: testValidatorRegistry,
      })
      expect(result).toMatchSnapshot()
    })
  })
})
