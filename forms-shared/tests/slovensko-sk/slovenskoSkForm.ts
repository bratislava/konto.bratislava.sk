import { getExampleFormPairs } from '../../src/example-forms/getExampleFormPairs'
import { generateSlovenskoSkXml } from '../../src/slovensko-sk/generateXml'
import { isSlovenskoSkFormDefinition } from '../../src/definitions/formDefinitionTypes'
import { renderApacheFopPdf } from '../../test-utils/apache-fop/renderApacheFopPdf'
import { expectPdfToMatchSnapshot } from '../../test-utils/expectPdfToMatchSnapshot'
import { transformXmlWithXslt } from '../../test-utils/transformXmlWithXslt'
import { getFoXslt } from '../../src/slovensko-sk/file-templates/foXslt'
import { getHtmlSbXslt } from '../../src/slovensko-sk/file-templates/htmlSbXslt'
import { generatePageScreenshot } from '../../test-utils/generatePageScreenshot'
import { getSchemaXsd } from '../../src/slovensko-sk/file-templates/schemaXsd'
import { formDefinitions } from '../../src/definitions/formDefinitions'
import { validateXml } from '../../test-utils/validateXml'
import { fetchSlovenskoSkFormMetadata } from '../../test-utils/fetchSlovenskoSkFormMetadata'

describe('slovenskoSkForm', () => {
  formDefinitions.filter(isSlovenskoSkFormDefinition).forEach((formDefinition) => {
    describe(`${formDefinition.slug}`, () => {
      it('schema XSD should match snapshot', () => {
        const xsdString = getSchemaXsd(formDefinition)
        expect(xsdString).toMatchSnapshot()
      })

      it(`should match Slovensko.sk data`, async () => {
        const metadata = await fetchSlovenskoSkFormMetadata(formDefinition)

        expect(metadata['dc:identifier']).toEqual([
          `http://data.gov.sk/doc/eform/${formDefinition.pospID}/${formDefinition.pospVersion}`,
        ])
        expect(metadata['dc:creator']).toEqual([formDefinition.gestor])
        expect(metadata['dc:publisher']).toEqual([formDefinition.publisher])
        expect(metadata['meta:version']).toEqual([formDefinition.pospVersion])

        // Change in the future when forms with limited date validity are added
        const inForceFromDate = new Date(metadata['meta:inForceFrom'][0])
        expect(inForceFromDate.getTime()).toBeLessThanOrEqual(new Date().getTime())
      })
    })
  })

  getExampleFormPairs({ formDefinitionFilterFn: isSlovenskoSkFormDefinition }).forEach(
    ({ formDefinition, exampleForm }) => {
      describe(`${exampleForm.name}`, () => {
        let xmlString: string
        beforeAll(async () => {
          xmlString = await generateSlovenskoSkXml(
            formDefinition,
            exampleForm.formData,
            exampleForm.serverFiles,
          )
        })

        it('XML should match snapshot', async () => {
          expect(xmlString).toMatchSnapshot()
        })

        it('XML should be valid', async () => {
          const xsdString = getSchemaXsd(formDefinition)
          const isValid = validateXml(xmlString, xsdString)

          expect(isValid).toBe(true)
        })

        it('PDF should match snapshot', async () => {
          const xsltString = getFoXslt(formDefinition, true)
          const pdfBuffer = await renderApacheFopPdf(xmlString, xsltString)

          await expectPdfToMatchSnapshot(pdfBuffer)
        }, /* The PDFs take a while to generate, so they need an increased timeout. */ 15000)

        describe(`HTML`, () => {
          let htmlString: string

          beforeAll(async () => {
            const xsltString = getHtmlSbXslt(formDefinition)
            htmlString = await transformXmlWithXslt(xmlString, xsltString)
          })
          ;(['desktop', 'mobile'] as const).forEach((size) => {
            it(`should match ${size} screenshot snapshot`, async () => {
              const screenshot = await generatePageScreenshot(htmlString, size)
              expect(screenshot).toMatchImageSnapshot()
            })
          })
        })
      })
    },
  )
})
