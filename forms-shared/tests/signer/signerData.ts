import { afterAll, beforeEach, describe, expect, test, vi } from 'vitest'
import { getExampleFormPairs } from '../../src/example-forms/getExampleFormPairs'
import {
  FormDefinitionSlovenskoSk,
  isSlovenskoSkFormDefinition,
} from '../../src/definitions/formDefinitionTypes'
import { getSignerData } from '../../src/signer/signerData'
import { testValidatorRegistry } from '../../test-utils/validatorRegistry'

describe('signerData', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: new Date('2024-01-01') })
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  getExampleFormPairs({
    formDefinitionFilterFn: (formDefinition): formDefinition is FormDefinitionSlovenskoSk =>
      isSlovenskoSkFormDefinition(formDefinition) && formDefinition.isSigned,
  }).forEach(({ formDefinition, exampleForm }) => {
    describe(`${exampleForm.name}`, () => {
      test('should generate correct signer data', async () => {
        const signerData = await getSignerData({
          formDefinition,
          formId: '123e4567-e89b-12d3-a456-426614174000',
          jsonVersion: formDefinition.jsonVersion,
          formData: exampleForm.formData,
          validatorRegistry: testValidatorRegistry,
          serverFiles: exampleForm.serverFiles,
        })

        expect(signerData).toMatchSnapshot()
      })
    })
  })
})
