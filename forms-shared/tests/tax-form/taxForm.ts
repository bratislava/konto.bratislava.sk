import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { getTaxFormPdfMapping } from '../../src/tax-form/mapping/pdf/pdf'
import { generateTaxPdf } from '../../src/tax-form/generateTaxPdf'
import { generateTaxXml } from '../../src/tax-form/generateTaxXml'
import { expectPdfToMatchSnapshot } from '../../test-utils/expectPdfToMatchSnapshot'
import { filterConsole } from '../../test-utils/filterConsole'
import { getExampleFormPairs } from '../../src/example-forms/getExampleFormPairs'
import { isSlovenskoSkTaxFormDefinition } from '../../src/definitions/formDefinitionTypes'
import { screenshotTestTimeout } from '../../test-utils/consts'
import { toMatchImageSnapshot } from 'jest-image-snapshot'
import { getTaxXsd } from '../../src/tax-form/taxXsdXslt'
import { formatValidateXmlResultErrors, validateXml } from '../../src/slovensko-sk/validateXml'

expect.extend({ toMatchImageSnapshot })

describe('tax-form', () => {
  getExampleFormPairs({ formDefinitionFilterFn: isSlovenskoSkTaxFormDefinition }).forEach(
    ({ exampleForm, formDefinition }) => {
      describe('PDF', () => {
        beforeEach(() => {
          // Without `shouldAdvanceTime` the PDF generation would hang indefinitely.
          vi.useFakeTimers({ now: new Date('2024-01-01'), shouldAdvanceTime: true })
        })

        afterEach(() => {
          vi.useRealTimers()
        })

        test(`should return correct PDF mapping for ${exampleForm.name}`, () => {
          expect(getTaxFormPdfMapping(exampleForm.formData, undefined)).toMatchSnapshot()
        })

        test(
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
      })

      describe('XML', () => {
        let xmlString: string

        beforeEach(() => {
          vi.useFakeTimers({ now: new Date('2024-01-01') })
          xmlString = generateTaxXml(exampleForm.formData, true, formDefinition)
        })

        afterEach(() => {
          vi.useRealTimers()
        })

        test(`should return correct XML for ${exampleForm.name}`, () => {
          expect(xmlString).toMatchSnapshot()
        })

        test(`should produce valid XML for ${exampleForm.name}`, async () => {
          const result = await validateXml(xmlString, getTaxXsd(formDefinition))
          if (!result.success && result.errors) {
            throw new Error(
              `XML validation errors: ${formatValidateXmlResultErrors(result.errors)}`,
            )
          }

          expect(result.success).toBe(true)
        })
      })
    },
  )
})
