import { describe, test } from 'vitest'

import { getExampleFormPairs } from '../../src/example-forms/getExampleFormPairs'
import { mergeClientAndServerFilesSummary } from '../../src/form-files/mergeClientAndServerFiles'
import { getFormSummary } from '../../src/summary/summary'
import { renderSummaryPdf } from '../../src/summary-pdf/renderSummaryPdf'
import { validateSummary } from '../../src/summary-renderer/validateSummary'
import { screenshotTestTimeout } from '../../test-utils/consts'
import { expectPdfToMatchSnapshot } from '../../test-utils/expectPdfToMatchSnapshot'
import { filterConsole } from '../../test-utils/filterConsole'
import { launchPlaywrightTest } from '../../test-utils/launchPlaywright'
import { testValidatorRegistry } from '../../test-utils/validatorRegistry'

describe('getSummaryJson', () => {
  getExampleFormPairs().forEach(({ formDefinition, exampleForm }) => {
    test(
      `${exampleForm.name} summary PDF should match snapshot`,
      async () => {
        const restore = filterConsole(
          'error',
          (message) =>
            typeof message === 'string' &&
            message.includes(
              'Support for defaultProps will be removed from function components in a future major release.',
            ),
        )

        const formSummary = getFormSummary({
          formDefinition,
          formDataJson: exampleForm.formData,
          validatorRegistry: testValidatorRegistry,
        })
        const fileInfos = mergeClientAndServerFilesSummary(
          exampleForm.clientFiles,
          exampleForm.serverFiles,
        )
        const { validationData } = validateSummary({
          schema: formDefinition.schema,
          formData: exampleForm.formData,
          fileInfos,
          validatorRegistry: testValidatorRegistry,
        })

        const pdfBuffer = await renderSummaryPdf({
          formSummary,
          validationData,
          launchBrowser: launchPlaywrightTest,
          clientFiles: exampleForm.clientFiles,
          serverFiles: exampleForm.serverFiles,
        })

        await expectPdfToMatchSnapshot(pdfBuffer)

        restore()
      },
      screenshotTestTimeout,
    )
  })
})
