import { getExampleFormPairs } from '../../src/example-forms/getExampleFormPairs'
import { generateSlovenskoSkXml } from '../../src/slovensko-sk/generateSlovenskoSkXml'
import {
  FormDefinitionSlovenskoSk,
  isSlovenskoSkTaxFormDefinition,
} from '../../src/definitions/formDefinitionTypes'
import { renderApacheFopPdf } from '../../test-utils/apache-fop/renderApacheFopPdf'
import { pdfFop } from './pdffop'
import { expectPdfToMatchSnapshot } from '../../test-utils/expectPdfToMatchSnapshot'

describe('generateSlovenskoSkXml', () => {
  getExampleFormPairs({ formDefinitionFilterFn: isSlovenskoSkTaxFormDefinition }).forEach(
    ({ formDefinition, exampleForm }) => {
      it(`${exampleForm.name} summary JSON should match snapshot`, async () => {
        const result = await generateSlovenskoSkXml(
          formDefinition as FormDefinitionSlovenskoSk,
          exampleForm.formData,
          exampleForm.serverFiles,
        )
        const pdf = await renderApacheFopPdf(result, pdfFop)
        await expectPdfToMatchSnapshot(pdf)
        // expect(result).toMatchSnapshot?()
      }, 15000)
    },
  )
})
