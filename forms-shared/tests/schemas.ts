import priznanieKDaniZNehnutelnosti from '../src/schemas/priznanieKDaniZNehnutelnosti'
import stanoviskoKInvesticnemuZameru from '../src/schemas/stanoviskoKInvesticnemuZameru'
import zavazneStanoviskoKInvesticnejCinnosti from '../src/schemas/zavazneStanoviskoKInvesticnejCinnosti'
import { baRjsfValidator } from '../src/form-utils/validators'
import komunitneZahrady from '../src/schemas/komunitneZahrady'
import predzahradky from '../src/schemas/predzahradky'
import { exampleTaxForm1 } from '../src/tax-form/examples/exampleTaxForm1'
import { exampleTaxForm2 } from '../src/tax-form/examples/exampleTaxForm2'
import { exampleTaxForm3 } from '../src/tax-form/examples/exampleTaxForm3'
import { exampleTaxForm4 } from '../src/tax-form/examples/exampleTaxForm4'
import { exampleTaxForm5 } from '../src/tax-form/examples/exampleTaxForm5'
import { baGetDefaultFormState } from '../src/form-utils/defaultFormState'
import { getSummaryJsonNode } from '../src/summary-json/getSummaryJsonNode'
import { renderSummaryPdf } from '../src/summary-pdf/renderSummaryPdf'
import { expectPdfToMatchSnapshot } from '../test-utils/expectPdfToMatchSnapshot'
import { filterConsole } from '../test-utils/filterConsole'

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
      expect(baRjsfValidator.ajv.validateSchema(definition.schema.schema, true)).toBe(true)
    })

    it('default form state should match snapshot', () => {
      filterConsole(
        'warn',
        (message) =>
          typeof message === 'string' && message.includes('could not merge subschemas in allOf'),
      )

      expect(baGetDefaultFormState(definition.schema.schema, {})).toMatchSnapshot()
    })

    definition.data.forEach((formData, index) => {
      it(`should validate example ${index + 1} correctly`, () => {
        expect(
          baRjsfValidator.isValid(definition.schema.schema, formData, definition.schema.schema),
        ).toBe(true)
      })

      it(`should match summary snapshot ${index + 1} correctly`, () => {
        expect(
          getSummaryJsonNode(definition.schema.schema, definition.schema.uiSchema, formData),
        ).toMatchSnapshot()
      })

      it(`should match PDF snapshot ${index + 1} correctly`, async () => {
        filterConsole(
          'error',
          (message) =>
            typeof message === 'string' &&
            message.includes(
              'Support for defaultProps will be removed from function components in a future major release.',
            ),
        )

        const pdfBuffer = await renderSummaryPdf(
          definition.schema.schema,
          definition.schema.uiSchema,
          formData,
        )

        await expectPdfToMatchSnapshot(pdfBuffer)
      })
    })
  })
})
