import { generatePageScreenshot } from '../../test-utils/generatePageScreenshot'
import { toMatchImageSnapshot } from 'jest-image-snapshot'
import { getExampleFormPairs } from '../../src/example-forms/getExampleFormPairs'
import { renderSummaryEmail } from '../../src/summary-email/renderSummaryEmail'

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

        emailHtml = await renderSummaryEmail({
          formDefinition,
          formData: exampleForm.formData,
          serverFiles: exampleForm.serverFiles,
          fileIdUrlMap,
        })
      })
      ;(['desktop', 'mobile'] as const).forEach((size) => {
        it(`summary email should match ${size} screenshot snapshot`, async () => {
          const screenshot = await generatePageScreenshot(emailHtml, size)
          expect(screenshot).toMatchImageSnapshot()
        })
      })
    })
  })
})
