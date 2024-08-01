import { getExampleFormPairs } from '../../src/example-forms/getExampleFormPairs'
import { generateSlovenskoSkXml } from '../../src/slovensko-sk/generateSlovenskoSkXml'
import { FormDefinitionSlovenskoSk } from '../../src/definitions/formDefinitionTypes'
import { renderApacheFopPdf } from '../../test-utils/apache-fop/renderApacheFopPdf'
import { pdfFop } from './pdffop'
import fs from 'node:fs'
import * as path from 'node:path'
import { expectPdfToMatchSnapshot } from '../../test-utils/expectPdfToMatchSnapshot'

describe('generateSlovenskoSkXml', () => {
  getExampleFormPairs().forEach(({ formDefinition, exampleForm }) => {
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
  })
})
