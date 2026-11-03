import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { isSlovenskoSkTaxFormDefinition } from '../../src/definitions/formDefinitionTypes'
import { getExampleFormPairs } from '../../src/example-forms/getExampleFormPairs'
import { formatValidateXmlResultErrors, validateXml } from '../../src/slovensko-sk/validateXml'
import { generateTaxPdf } from '../../src/tax-form/generateTaxPdf'
import { generateTaxXml } from '../../src/tax-form/generateTaxXml'
import { getTaxFormPdfMapping } from '../../src/tax-form/mapping/pdf/pdf'
import { poznamkaShared } from '../../src/tax-form/mapping/shared/poznamkaShared'
import { getTaxXsd } from '../../src/tax-form/taxXsdXslt'
import { screenshotTestTimeout } from '../../test-utils/consts'
import { expectPdfToMatchSnapshot } from '../../test-utils/expectPdfToMatchSnapshot'
import { filterConsole } from '../../test-utils/filterConsole'

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

  // Forms saved before `maRodneCislo` was introduced don't have it.
  const example5WithoutMaRodneCislo = {
    ...example5.exampleForm.formData,
    udajeODanovnikovi: {
      ...example5.exampleForm.formData.udajeODanovnikovi,
      maRodneCislo: undefined,
    },
    bezpodieloveSpoluvlastnictvoManzelov: {
      ...example5.exampleForm.formData.bezpodieloveSpoluvlastnictvoManzelov,
      maRodneCislo: undefined,
    },
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
          const restore = filterConsole(
            'warn',
            (message) =>
              message ===
              'Warning: _getAppearance: OffscreenCanvas is not supported, annotation may not render correctly.',
          )

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

    test('form without maRodneCislo should produce the same PDF mapping as with maRodneCislo', () => {
      expect(getTaxFormPdfMapping(example5WithoutMaRodneCislo, undefined)).toEqual(
        getTaxFormPdfMapping(example5.exampleForm.formData, undefined),
      )
    })

    test('invalid rodné číslo should be kept in poznámka', () => {
      const { poznamka } = poznamkaShared({
        ...example5.exampleForm.formData,
        udajeODanovnikovi: {
          ...example5.exampleForm.formData.udajeODanovnikovi,
          rodneCislo: '123456/7890',
        },
      })

      expect(poznamka).toContain('Rodné číslo (nevalidné): 123456/7890')
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

    test('form without maRodneCislo should produce the same XML as with maRodneCislo', () => {
      expect(generateTaxXml(example5WithoutMaRodneCislo, true, example5.formDefinition)).toEqual(
        generateTaxXml(example5.exampleForm.formData, true, example5.formDefinition),
      )
    })
  })
})
