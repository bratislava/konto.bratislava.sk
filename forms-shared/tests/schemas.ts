import priznanieKDaniZNehnutelnosti from '../src/definitions/priznanie-k-dani-z-nehnutelnosti'
import stanoviskoKInvesticnemuZameru from '../src/definitions/stanovisko-k-investicnemu-zameru'
import zavazneStanoviskoKInvesticnejCinnosti from '../src/definitions/zavazne-stanovisko-k-investicnej-cinnosti'
import { baAjvValidator, baRjsfValidator } from '../src/form-utils/validators'
import komunitneZahrady from '../src/definitions/komunitne-zahrady'
import predzahradky from '../src/definitions/predzahradky'
import { exampleTaxForm1 } from '../src/tax-form/examples/exampleTaxForm1'
import { exampleTaxForm2 } from '../src/tax-form/examples/exampleTaxForm2'
import { exampleTaxForm3 } from '../src/tax-form/examples/exampleTaxForm3'
import { exampleTaxForm4 } from '../src/tax-form/examples/exampleTaxForm4'
import { exampleTaxForm5 } from '../src/tax-form/examples/exampleTaxForm5'
import { RJSFSchema } from '@rjsf/utils'
import { baGetDefaultFormState } from '../src/form-utils/defaultFormState'
import { getSummaryJsonNode } from '../src/summary-json/getSummaryJsonNode'
import { renderSummaryPdf } from '../src/summary-pdf/renderSummaryPdf'
import { expectPdfToMatchSnapshot } from './test-utils/expectPdfToMatchSnapshot'

const definitions = [
  {
    name: 'priznanieKDaniZNehnutelnosti',
    schema: priznanieKDaniZNehnutelnosti,
    data: [exampleTaxForm1, exampleTaxForm2, exampleTaxForm3, exampleTaxForm4, exampleTaxForm5],
  },
  {
    name: 'stanoviskoKInvesticnemuZameru',
    schema: stanoviskoKInvesticnemuZameru,
    data: [],
  },
  {
    name: 'zavazneStanoviskoKInvesticnejCinnosti',
    schema: zavazneStanoviskoKInvesticnejCinnosti,
    data: [],
  },
  {
    name: 'komunitneZahrady',
    schema: komunitneZahrady,
    data: [],
  },
  {
    name: 'predzahradky',
    schema: predzahradky,
    data: [],
  },
]

definitions.forEach((definition) => {
  describe(definition.name, () => {
    it('matches snapshot', () => {
      expect(definition.schema).toMatchSnapshot()
    })

    it('is valid schema', () => {
      expect(baAjvValidator.validateSchema(definition.schema.schema, true)).toBe(true)
    })

    it('default form state should match snapshot', () => {
      expect(baGetDefaultFormState(definition.schema.schema as RJSFSchema, {})).toMatchSnapshot()
    })

    definition.data.forEach((formData, index) => {
      it(`should validate example ${index + 1} correctly`, () => {
        expect(
          baRjsfValidator.isValid(
            definition.schema.schema as RJSFSchema,
            formData,
            definition.schema.schema as RJSFSchema,
          ),
        ).toBe(true)
      })

      it(`should match summary snapshot ${index + 1} correctly`, () => {
        expect(
          getSummaryJsonNode(
            definition.schema.schema as RJSFSchema,
            definition.schema.uiSchema,
            formData,
          ),
        ).toMatchSnapshot()
      })

      it(`should match PDF snapshot ${index + 1} correctly`, async () => {
        const pdfBuffer = await renderSummaryPdf(
          definition.schema.schema as RJSFSchema,
          definition.schema.uiSchema,
          formData,
        )

        await expectPdfToMatchSnapshot(pdfBuffer)
      })
    })
  })
})
