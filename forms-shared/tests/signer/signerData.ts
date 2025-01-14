import { getExampleFormPairs } from '../../src/example-forms/getExampleFormPairs'
import { isSlovenskoSkFormDefinition } from '../../src/definitions/formDefinitionTypes'
import { getSignerData } from '../../src/signer/signerData'
import { testValidatorRegistry } from '../../test-utils/validatorRegistry'

describe('signerData', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: new Date('2024-01-01') })
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  getExampleFormPairs({ formDefinitionFilterFn: isSlovenskoSkFormDefinition }).forEach(
    ({ formDefinition, exampleForm }) => {
      describe(`${exampleForm.name}`, () => {
        it('should generate correct signer data', async () => {
          const signerData = await getSignerData({
            formDefinition,
            formId: '123e4567-e89b-12d3-a456-426614174000',
            formData: exampleForm.formData,
            validatorRegistry: testValidatorRegistry,
            serverFiles: exampleForm.serverFiles,
          })

          expect(signerData).toMatchSnapshot()
        })
      })
    },
  )
})
