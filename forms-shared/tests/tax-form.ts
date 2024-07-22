import { exampleTaxForm1 } from '../src/tax-form/examples/exampleTaxForm1'
import { exampleTaxForm2 } from '../src/tax-form/examples/exampleTaxForm2'
import { exampleTaxForm3 } from '../src/tax-form/examples/exampleTaxForm3'
import { exampleTaxForm4 } from '../src/tax-form/examples/exampleTaxForm4'
import { exampleTaxForm5 } from '../src/tax-form/examples/exampleTaxForm5'
import { getTaxFormPdfMapping } from '../src/tax-form/mapping/pdf/pdf'
import { generateTaxPdf } from '../src/tax-form/generateTaxPdf'
import { generateTaxXml } from '../src/tax-form/generateTaxXml'
import { expectPdfToMatchSnapshot } from '../test-utils/expectPdfToMatchSnapshot'
import { filterConsole } from '../test-utils/filterConsole'

const examples = [
  exampleTaxForm1,
  exampleTaxForm2,
  exampleTaxForm3,
  exampleTaxForm4,
  exampleTaxForm5,
]
describe('tax-form', () => {
  beforeEach(() => {
    // Without `advanceTimers` the PDF generation would hang indefinitely.
    jest.useFakeTimers({ now: new Date('2024-01-01'), advanceTimers: 1 })
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  examples.forEach((formData, index) => {
    it(`should return correct PDF mapping for example ${index + 1}`, () => {
      expect(getTaxFormPdfMapping(formData, undefined)).toMatchSnapshot()
    })

    it(`should return correct XML for example ${index + 1}`, () => {
      expect(generateTaxXml(formData, true)).toMatchSnapshot()
    })

    it(`should match snapshot for generated PDF example ${index + 1}`, async () => {
      filterConsole(
        'log',
        (message) =>
          message ===
          'Warning: _getAppearance: OffscreenCanvas is not supported, annotation may not render correctly.',
      )

      const base64Pdf = await generateTaxPdf({ formData })

      await expectPdfToMatchSnapshot(`data:application/pdf;base64,${base64Pdf}`)
    }, /* The PDFs take a while to generate, so they need an increased timeout. */ 10000)
  })
})
