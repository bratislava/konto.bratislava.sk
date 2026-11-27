import type { RJSFSchema } from '@rjsf/utils'
import { describe, expect, test } from 'vitest'

import { getExampleFormPairs } from '../../src/example-forms/getExampleFormPairs'
import { getSummaryJson } from '../../src/summary-json/getSummaryJson'
import { testValidatorRegistry } from '../../test-utils/validatorRegistry'

describe('getSummaryJson', () => {
  getExampleFormPairs().forEach(({ formDefinition, exampleForm }) => {
    test(`${exampleForm.name} summary JSON should match snapshot`, () => {
      const result = getSummaryJson({
        schema: formDefinition.schema,
        formData: exampleForm.formData,
        validatorRegistry: testValidatorRegistry,
      })
      expect(result).toMatchSnapshot()
    })
  })

  test('throws for a field the summary JSON does not collect', () => {
    const schema: RJSFSchema = {
      title: 'Form',
      type: 'object',
      properties: {
        step: {
          title: 'Step',
          type: 'object',
          baOrder: 1,
          properties: {
            // Without `ui:widget`, RJSF renders the field with its default text widget.
            input: { type: 'string', title: 'Input', baOrder: 1 },
          },
        },
      },
    }

    expect(() =>
      getSummaryJson({
        schema,
        formData: { step: { input: 'value' } },
        validatorRegistry: testValidatorRegistry,
      }),
    ).toThrow('Unexpected markup rendered for the summary JSON')
  })
})
