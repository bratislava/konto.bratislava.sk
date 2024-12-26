import { getTaxFormPdfMapping } from '../../src/tax-form/mapping/pdf/pdf'
import { generateTaxPdf } from '../../src/tax-form/generateTaxPdf'
import { generateTaxXml } from '../../src/tax-form/generateTaxXml'
import { expectPdfToMatchSnapshot } from '../../test-utils/expectPdfToMatchSnapshot'
import { filterConsole } from '../../test-utils/filterConsole'
import { getExampleFormPairs } from '../../src/example-forms/getExampleFormPairs'
import { isSlovenskoSkTaxFormDefinition } from '../../src/definitions/formDefinitionTypes'
import { screenshotTestTimeout } from '../../test-utils/consts'
import { getFormDefinitionBySlug } from '../../src/definitions/getFormDefinitionBySlug'

describe('tax-form', () => {
  beforeEach(() => {
    // Without `advanceTimers` the PDF generation would hang indefinitely.
    jest.useFakeTimers({ now: new Date('2024-01-01'), advanceTimers: 1 })
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  getExampleFormPairs({ formDefinitionFilterFn: isSlovenskoSkTaxFormDefinition }).forEach(
    ({ exampleForm }) => {
      it(`should return correct PDF mapping for ${exampleForm.name}`, () => {
        expect(getTaxFormPdfMapping(exampleForm.formData, undefined)).toMatchSnapshot()
      })

      it(`should return correct XML for ${exampleForm.name}`, () => {
        const formDefinition = getFormDefinitionBySlug('priznanie-k-dani-z-nehnutelnosti')
        if (!formDefinition || !isSlovenskoSkTaxFormDefinition(formDefinition)) {
          throw new Error('Form definition not found')
        }

        expect(generateTaxXml(exampleForm.formData, true, formDefinition)).toMatchSnapshot()
      })

      it(
        `should match snapshot for generated PDF ${exampleForm.name}`,
        async () => {
          filterConsole(
            'log',
            (message) =>
              message ===
              'Warning: _getAppearance: OffscreenCanvas is not supported, annotation may not render correctly.',
          )

          const base64Pdf = await generateTaxPdf({ formData: exampleForm.formData })

          await expectPdfToMatchSnapshot(`data:application/pdf;base64,${base64Pdf}`)
        },
        screenshotTestTimeout,
      )
    },
  )
})
