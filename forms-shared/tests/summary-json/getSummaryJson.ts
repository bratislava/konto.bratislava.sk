import { describe, test, expect } from 'vitest'
import { getExampleFormPairs } from '../../src/example-forms/getExampleFormPairs'
import { getSummaryJsonNode } from '../../src/summary-json/getSummaryJsonNode'
import { testValidatorRegistry } from '../../test-utils/validatorRegistry'

describe('getSummaryJson', () => {
  getExampleFormPairs().forEach(({ formDefinition, exampleForm }) => {
    test(`${exampleForm.name} summary JSON should match snapshot`, () => {
      const result = getSummaryJsonNode(
        formDefinition.schema,
        exampleForm.formData,
        testValidatorRegistry,
      )
      expect(result).toMatchSnapshot()
    })
  })
})
