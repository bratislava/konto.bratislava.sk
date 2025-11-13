import { beforeEach, afterEach, describe, expect, test } from 'vitest'
import jsdom from 'jsdom'
import { getExampleFormPairs } from '../../src/example-forms/getExampleFormPairs'
import { getSummaryJsonBrowser } from '../../src/summary-json/getSummaryJsonBrowser'
import { testValidatorRegistry } from '../../test-utils/validatorRegistry'

describe('getSummaryJsonBrowser', () => {
  let originalWindow: (Window & typeof globalThis) | undefined

  beforeEach(() => {
    // Store original window if it exists
    originalWindow = (globalThis as any).window

    // Create a jsdom instance to provide DOMParser
    const jsDomInstance = new jsdom.JSDOM()
    const domParser = jsDomInstance.window.DOMParser

    // Mock window.DOMParser for browser environment
    // In browser, window is a global variable, so we need to make it available globally
    const mockWindow = {
      DOMParser: domParser,
    } as Window & typeof globalThis

    // We're intentionally adding window to global scope for testing
    ;(globalThis as any).window = mockWindow
    // Also define it on global for compatibility
    ;(global as any).window = mockWindow
  })

  afterEach(() => {
    // Restore original window if it existed
    if (originalWindow !== undefined) {
      ;(globalThis as any).window = originalWindow
      ;(global as any).window = originalWindow
    } else {
      // We're intentionally removing window for cleanup
      delete (globalThis as any).window
      delete (global as any).window
    }
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
