import { beforeAll, describe, expect, test } from 'vitest'
import { generatePageScreenshot } from '../../test-utils/generatePageScreenshot'
import { getExampleFormPairs } from '../../src/example-forms/getExampleFormPairs'
import { renderSummaryEmail } from '../../src/summary-email/renderSummaryEmail'
import { mapValues } from 'lodash'
import { screenshotTestTimeout } from '../../test-utils/consts'
import { testValidatorRegistry } from '../../test-utils/validatorRegistry'
import { toMatchImageSnapshot } from 'jest-image-snapshot'
import { getFormSummary } from '../../src/summary/summary'

expect.extend({ toMatchImageSnapshot })

describe('renderSummaryEmail', () => {
  getExampleFormPairs().forEach(({ formDefinition, exampleForm }) => {
    describe(`${exampleForm.name}`, () => {
      let emailHtml: string

      beforeAll(async () => {
        const fileIdUrlMapEntries = (exampleForm.serverFiles ?? []).map((file) => [
          file.id,
          `https://example.com/${file.id}`,
        ])
        const fileIdUrlMap = Object.fromEntries(fileIdUrlMapEntries)
        const fileIdInfoMap = mapValues(fileIdUrlMap, (url, id) => ({
          url,
          fileName: `${id}.pdf`,
        }))

        const formSummary = getFormSummary({
          formDefinition,
          formDataJson: exampleForm.formData,
          validatorRegistry: testValidatorRegistry,
        })
        emailHtml = await renderSummaryEmail({
          formSummary,
          serverFiles: exampleForm.serverFiles,
          fileIdInfoMap,
          validatorRegistry: testValidatorRegistry,
          withHtmlBodyTags: true,
        })
      })
      ;(['desktop', 'mobile'] as const).forEach((size) => {
        test(
          `summary email should match ${size} screenshot snapshot`,
          async () => {
            const screenshot = await generatePageScreenshot(emailHtml, size)
            expect(screenshot).toMatchImageSnapshot()
          },
          screenshotTestTimeout,
        )
      })
    })
  })
})
