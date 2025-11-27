import { beforeEach, afterEach, describe, expect, test, vi } from 'vitest'
import jsdom from 'jsdom'
import { getExampleFormPairs } from '../../src/example-forms/getExampleFormPairs'
import { getSummaryJsonBrowser } from '../../src/summary-json/getSummaryJsonBrowser'
import { testValidatorRegistry } from '../../test-utils/validatorRegistry'

describe('getSummaryJsonBrowser', () => {
  beforeEach(() => {
    const jsDomInstance = new jsdom.JSDOM()
    vi.stubGlobal('window', jsDomInstance.window)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  getExampleFormPairs().forEach(({ formDefinition, exampleForm }) => {
    test(`${exampleForm.name} summary JSON should match snapshot`, () => {
      const result = getSummaryJsonBrowser({
        schema: formDefinition.schema,
        formData: exampleForm.formData,
        validatorRegistry: testValidatorRegistry,
      })
      expect(result).toMatchSnapshot()
    })
  })
})
