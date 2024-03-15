import { exampleTaxForm1 } from '../src/tax-form/examples/exampleTaxForm1'
import { exampleTaxForm2 } from '../src/tax-form/examples/exampleTaxForm2'
import { exampleTaxForm3 } from '../src/tax-form/examples/exampleTaxForm3'
import { exampleTaxForm4 } from '../src/tax-form/examples/exampleTaxForm4'
import { exampleTaxForm5 } from '../src/tax-form/examples/exampleTaxForm5'
import { getTaxFormPdfMapping } from '../src/tax-form/mapping/pdf/pdf'
import { getTaxFormXml } from '../src/tax-form/mapping/xml/xml'

const examples = [
  exampleTaxForm1,
  exampleTaxForm2,
  exampleTaxForm3,
  exampleTaxForm4,
  exampleTaxForm5,
]

describe('tax-form', () => {
  jest.useFakeTimers().setSystemTime(new Date('2024-01-01'))

  examples.forEach((form, index) => {
    it(`should return correct PDF mapping for example ${index + 1}`, () => {
      expect(getTaxFormPdfMapping(form)).toMatchSnapshot()
    })

    it(`should return correct XML for example ${index + 1}`, () => {
      expect(getTaxFormXml(form, true)).toMatchSnapshot()
    })
  })
})
