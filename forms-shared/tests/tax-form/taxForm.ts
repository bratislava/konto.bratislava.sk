import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { getTaxFormPdfMapping } from '../../src/tax-form/mapping/pdf/pdf'
import { generateTaxPdf } from '../../src/tax-form/generateTaxPdf'
import { generateTaxXml } from '../../src/tax-form/generateTaxXml'
import { expectPdfToMatchSnapshot } from '../../test-utils/expectPdfToMatchSnapshot'
import { filterLogLines } from '../../test-utils/filterLogLines'
import { getExampleFormPairs } from '../../src/example-forms/getExampleFormPairs'
import { isSlovenskoSkTaxFormDefinition } from '../../src/definitions/formDefinitionTypes'
import { screenshotTestTimeout } from '../../test-utils/consts'
import { toMatchImageSnapshot } from 'jest-image-snapshot'
import { getTaxXsd } from '../../src/tax-form/taxXsdXslt'
import { formatValidateXmlResultErrors, validateXml } from '../../src/slovensko-sk/validateXml'

expect.extend({ toMatchImageSnapshot })

describe('taxForm', () => {
  const exampleFormPairs = getExampleFormPairs({
    formDefinitionFilterFn: isSlovenskoSkTaxFormDefinition,
  })
  const example5 = exampleFormPairs.find(
    ({ exampleForm }) => exampleForm.name === 'priznanieKDaniZNehnutelnostiExample5',
  )
  const example5NoCalculators = exampleFormPairs.find(
    ({ exampleForm }) => exampleForm.name === 'priznanieKDaniZNehnutelnostiExample5NoCalculators',
  )
  if (!example5 || !example5NoCalculators) {
    throw new Error('example5 or example5NoCalculators is undefined')
  }

  describe('PDF', () => {
    beforeEach(() => {
      // Without `shouldAdvanceTime` the PDF generation would hang indefinitely.
      vi.useFakeTimers({ now: new Date('2024-01-01'), shouldAdvanceTime: true })
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    exampleFormPairs.forEach(({ exampleForm }) => {
      test(`should return correct PDF mapping for ${exampleForm.name}`, () => {
        expect(getTaxFormPdfMapping(exampleForm.formData, undefined)).toMatchSnapshot()
      })

      test(
        `should match snapshot for generated PDF ${exampleForm.name}`,
        async () => {
          const restore = filterLogLines({
            severity: 'LOG',
            messageIncludes:
              'Warning: _getAppearance: OffscreenCanvas is not supported, annotation may not render correctly.',
          })

          const base64Pdf = await generateTaxPdf({ formData: exampleForm.formData })

          await expectPdfToMatchSnapshot(`data:application/pdf;base64,${base64Pdf}`)
          restore()
        },
        screenshotTestTimeout,
      )
    })

    test('example5 and example5NoCalculators should produce the same PDF mapping', async () => {
      const example5PdfMapping = getTaxFormPdfMapping(example5.exampleForm.formData, undefined)
      const example5NoCalculatorsPdfMapping = getTaxFormPdfMapping(
        example5NoCalculators.exampleForm.formData,
        undefined,
      )
      expect(example5PdfMapping).toEqual(example5NoCalculatorsPdfMapping)
    })
  })

  describe('XML', () => {
    beforeEach(() => {
      vi.useFakeTimers({ now: new Date('2024-01-01') })
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    exampleFormPairs.forEach(({ exampleForm, formDefinition }) => {
      test(`should match snapshot for generated XML for ${exampleForm.name}`, () => {
        const xmlString = generateTaxXml(exampleForm.formData, true, formDefinition)
        expect(xmlString).toMatchSnapshot()
      })

      test(`should produce valid XML for ${exampleForm.name}`, async () => {
        const xmlString = generateTaxXml(exampleForm.formData, true, formDefinition)
        const result = await validateXml(xmlString, getTaxXsd(formDefinition))
        if (!result.success && result.errors) {
          throw new Error(`XML validation errors: ${formatValidateXmlResultErrors(result.errors)}`)
        }

        expect(result.success).toBe(true)
      })
    })

    test('example5 and example5NoCalculators should produce the same XML', () => {
      const example5Xml = generateTaxXml(
        example5.exampleForm.formData,
        true,
        example5.formDefinition,
      )
      const example5NoCalculatorsXml = generateTaxXml(
        example5NoCalculators.exampleForm.formData,
        true,
        example5NoCalculators.formDefinition,
      )
      expect(example5Xml).toEqual(example5NoCalculatorsXml)
    })
  })
})
