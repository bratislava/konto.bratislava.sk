import { beforeAll, describe, expect, test } from 'vitest'
import { getExampleFormPairs } from '../../src/example-forms/getExampleFormPairs'
import { generateSlovenskoSkXmlObject } from '../../src/slovensko-sk/generateXml'
import { isSlovenskoSkFormDefinition } from '../../src/definitions/formDefinitionTypes'
import { renderApacheFopPdf } from '../../test-utils/apache-fop/renderApacheFopPdf'
import { expectPdfToMatchSnapshot } from '../../test-utils/expectPdfToMatchSnapshot'
import { transformXmlWithXslt } from '../../test-utils/transformXmlWithXslt'
import { getFoXslt } from '../../src/slovensko-sk/file-templates/foXslt'
import { getHtmlSbXslt } from '../../src/slovensko-sk/file-templates/htmlSbXslt'
import { generatePageScreenshot } from '../../test-utils/generatePageScreenshot'
import { getSchemaXsd } from '../../src/slovensko-sk/file-templates/schemaXsd'
import { formDefinitions } from '../../src/definitions/formDefinitions'
import { validateXml } from '../../src/slovensko-sk/validateXml'
import {
  fetchSlovenskoSkMetadata,
  findSlovenskoSkFormMetadata,
  SlovenskoSkMetadataJson,
} from '../../test-utils/fetchSlovenskoSkFormMetadata'
import { extractJsonFromSlovenskoSkXml } from '../../src/slovensko-sk/extractJson'
import { buildSlovenskoSkXml } from '../../src/slovensko-sk/xmlBuilder'
import { screenshotTestTimeout } from '../../test-utils/consts'
import { testValidatorRegistry } from '../../test-utils/validatorRegistry'
import { getFormSummary } from '../../src/summary/summary'
import { getSlovenskoSkMetaIdentifier } from '../../src/slovensko-sk/urls'

describe('slovenskoSkForm', () => {
  let slovenskoSkMetadata: SlovenskoSkMetadataJson[]

  beforeAll(async () => {
    slovenskoSkMetadata = await fetchSlovenskoSkMetadata()
  })

  formDefinitions.filter(isSlovenskoSkFormDefinition).forEach((formDefinition) => {
    describe(`${formDefinition.slug}`, () => {
      test('schema XSD should match snapshot', () => {
        const xsdString = getSchemaXsd(formDefinition)
        expect(xsdString).toMatchSnapshot()
      })

      test(`should match Slovensko.sk data`, async () => {
        // temp until the test pospid is removed, we don't want to publish this form into production forms
        if (formDefinition.pospID === 'hmba.eforms.bratislava.obec_024') return

        const metadata = findSlovenskoSkFormMetadata(slovenskoSkMetadata, formDefinition)

        expect(metadata.XSDtargetNamespace).toContain(formDefinition.pospID)
        expect(metadata.identifier).toEqual(getSlovenskoSkMetaIdentifier(formDefinition))
        expect(metadata.shortIdentifier).toEqual(formDefinition.pospID)
        expect(metadata.publisherURI).toEqual(formDefinition.publisher)
        expect(metadata.version).toEqual(formDefinition.pospVersion)

        // Change in the future when forms with limited date validity are added
        const inForceFromDate = new Date(metadata.inForceFrom)
        expect(inForceFromDate.getTime()).toBeLessThanOrEqual(new Date().getTime())
      })
    })
  })

  getExampleFormPairs({ formDefinitionFilterFn: isSlovenskoSkFormDefinition }).forEach(
    ({ formDefinition, exampleForm }) => {
      describe(`${exampleForm.name}`, () => {
        let xmlString: string
        beforeAll(async () => {
          const formSummary = getFormSummary({
            formDefinition,
            formDataJson: exampleForm.formData,
            validatorRegistry: testValidatorRegistry,
          })
          const xmlObject = await generateSlovenskoSkXmlObject({
            formDefinition,
            formSummary,
            jsonVersion: formDefinition.jsonVersion,
            formData: exampleForm.formData,
            serverFiles: exampleForm.serverFiles,
          })
          xmlString = buildSlovenskoSkXml(xmlObject, { headless: false, pretty: true })
        })

        test('XML should match snapshot', async () => {
          expect(xmlString).toMatchSnapshot()
        })

        test('XML should be valid', async () => {
          const xsdString = getSchemaXsd(formDefinition)
          const isValid = await validateXml(xmlString, xsdString)

          expect(isValid).toBe(true)
        })

        test('extractJsonFromSlovenskoSkXml should extract the same JSON from XML', async () => {
          const extractedJson = await extractJsonFromSlovenskoSkXml(formDefinition, xmlString)

          expect(extractedJson).toEqual({
            jsonVersion: formDefinition.jsonVersion,
            formDataJson: exampleForm.formData,
          })
        })

        test(
          'PDF should match snapshot',
          async () => {
            const xsltString = getFoXslt(formDefinition, true)
            const pdfBuffer = await renderApacheFopPdf(xmlString, xsltString)

            await expectPdfToMatchSnapshot(pdfBuffer)
          },
          screenshotTestTimeout,
        )

        describe(`HTML`, () => {
          let htmlString: string

          beforeAll(async () => {
            const xsltString = getHtmlSbXslt(formDefinition)
            htmlString = await transformXmlWithXslt(xmlString, xsltString)
          })
          ;(['desktop', 'mobile'] as const).forEach((size) => {
            test(`should match ${size} screenshot snapshot`, async () => {
              const screenshot = await generatePageScreenshot(htmlString, size)
              expect(screenshot).toMatchImageSnapshot()
            })
          })
        })
      })
    },
  )
})
