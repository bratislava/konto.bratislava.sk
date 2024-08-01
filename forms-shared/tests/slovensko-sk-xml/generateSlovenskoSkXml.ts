import { getExampleFormPairs } from '../../src/example-forms/getExampleFormPairs'
import { generateSlovenskoSkXml } from '../../src/slovensko-sk/generateSlovenskoSkXml'
import {
  FormDefinitionSlovenskoSk,
  isSlovenskoSkTaxFormDefinition,
} from '../../src/definitions/formDefinitionTypes'
import { renderApacheFopPdf } from '../../test-utils/apache-fop/renderApacheFopPdf'
import { pdfFop } from './pdffop'
import fs from 'node:fs'
import * as path from 'node:path'
import { expectPdfToMatchSnapshot } from '../../test-utils/expectPdfToMatchSnapshot'
import { transformXmlWithXslt } from '../../test-utils/transformXmlWithXslt'
import { getHtmlx, getXsd } from './htmlx'

describe('generateSlovenskoSkXml', () => {
  getExampleFormPairs({ formDefinitionFilterFn: isSlovenskoSkTaxFormDefinition }).forEach(
    ({ formDefinition, exampleForm }) => {
      it(`${exampleForm.name} summary JSON should match snapshot`, async () => {
        const result = await generateSlovenskoSkXml(
          formDefinition as FormDefinitionSlovenskoSk,
          exampleForm.formData,
          exampleForm.serverFiles,
        )
        console.log(result)
        const pdf = await renderApacheFopPdf(
          result,
          pdfFop({
            formDefinition: formDefinition as FormDefinitionSlovenskoSk,
            testEnvironment: true,
          }),
        )
        fs.writeFileSync(path.join(__dirname, `${exampleForm.name}.pdf`), pdf)
        await expectPdfToMatchSnapshot(pdf)
      }, 15000)

      it(`${exampleForm.name} xx`, async () => {
        const result = await generateSlovenskoSkXml(
          formDefinition as FormDefinitionSlovenskoSk,
          exampleForm.formData,
          exampleForm.serverFiles,
        )
        fs.writeFileSync(path.join(__dirname, `${exampleForm.name}.xml`), result)
        const html = getHtmlx({
          formDefinition: formDefinition as FormDefinitionSlovenskoSk,
        })
        fs.writeFileSync(path.join(__dirname, `htmlx.xsl`), html)
        // const tw = await getTailwindCss()
        // fs.writeFileSync(path.join(__dirname, `tailwind.css`), tw)
        const xsd = getXsd({
          formDefinition: formDefinition as FormDefinitionSlovenskoSk,
        })
        fs.writeFileSync(path.join(__dirname, `schema.xsd`), xsd)
        const b = await transformXmlWithXslt(result, html)
        fs.writeFileSync(path.join(__dirname, `${exampleForm.name}.html`), b)

        expect(b).toMatchSnapshot()
      })
    },
  )
})
