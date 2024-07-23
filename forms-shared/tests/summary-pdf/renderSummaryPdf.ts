import { getExampleFormPairs } from '../../src/example-forms/getExampleFormPairs'
import { filterConsole } from '../../test-utils/filterConsole'
import { renderSummaryPdf } from '../../src/summary-pdf/renderSummaryPdf'
import { launchPlaywrightTest } from '../../test-utils/launchPlaywright'
import { expectPdfToMatchSnapshot } from '../../test-utils/expectPdfToMatchSnapshot'

describe('getSummaryJson', () => {
  getExampleFormPairs().forEach(({ formDefinition, exampleForm }) => {
    it(`${exampleForm.name} summary PDF should match snapshot`, async () => {
      filterConsole(
        'error',
        (message) =>
          typeof message === 'string' &&
          message.includes(
            'Support for defaultProps will be removed from function components in a future major release.',
          ),
      )

      const pdfBuffer = await renderSummaryPdf({
        jsonSchema: formDefinition.schemas.schema,
        uiSchema: formDefinition.schemas.uiSchema,
        formData: exampleForm.formData,
        launchBrowser: launchPlaywrightTest,
        serverFiles: exampleForm.serverFiles,
      })

      await expectPdfToMatchSnapshot(pdfBuffer)
    })
  })
})
