import { exampleTaxForm1 } from '../src/tax-form/examples/exampleTaxForm1'
import { exampleTaxForm2 } from '../src/tax-form/examples/exampleTaxForm2'
import { exampleTaxForm3 } from '../src/tax-form/examples/exampleTaxForm3'
import { exampleTaxForm4 } from '../src/tax-form/examples/exampleTaxForm4'
import { exampleTaxForm5 } from '../src/tax-form/examples/exampleTaxForm5'
import { getE2eSequence } from '../src/e2e-sequence/get-e2e-sequence'
import priznanieKDaniZNehnutelnosti from '../src/definitions/priznanie-k-dani-z-nehnutelnosti'

const { schema, uiSchema } = priznanieKDaniZNehnutelnosti

const examples = [
  exampleTaxForm1,
  exampleTaxForm2,
  exampleTaxForm3,
  exampleTaxForm4,
  exampleTaxForm5,
]

describe('e2e-sequence', () => {
  examples.forEach((form, index) => {
    it(`should return correct PDF mapping for example ${index + 1}`, () => {
      expect(getE2eSequence({ jsonSchema: schema, uiSchema, data: form })).toMatchSnapshot()
    })
  })
})
