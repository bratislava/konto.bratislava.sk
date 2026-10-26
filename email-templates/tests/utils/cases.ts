import { getExampleFormPairs } from 'forms-shared/example-forms/getExampleFormPairs'
import { createSingleUseValidatorRegistry } from 'forms-shared/form-utils/validatorRegistry'
import { getFormSummary } from 'forms-shared/summary/summary'

import { renderSummaryEmail } from '../../src/forms/summary-email'

/**
 * One rendered example of an email. Test files only list cases while Playwright collects tests;
 * the render functions run inside the tests.
 */
export type EmailCase = {
  /** Snapshot directory under `tests/__snapshots__`: product, email, example. */
  path: readonly [product: string, email: string, example: string]
  /** The whole HTML document, as it is screenshotted. */
  renderDocument: () => Promise<string>
  /** Text snapshots of the markup project, by file name. */
  renderTextSnapshots: () => Promise<Record<string, string>>
  /** Screenshot projects this case runs in; all of them when omitted. */
  isScreenshotProject?: (projectName: string) => boolean
}

/** `priznanieKDaniZNehnutelnostiExample5` → `priznanie-k-dani-z-nehnutelnosti-example-5` */
const toSlug = (value: string) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .replace(/([a-zA-Z])([0-9])/g, '$1-$2')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/**
 * The summary fragment pasted into the Mailgun "new submission" templates, for every forms-shared
 * example form. It keeps the coverage it had in forms-shared: the fragment as sent, and screenshots
 * of the full document in Chromium, light mode only (it has no dark styles).
 */
const summaryEmailCases = (): EmailCase[] => {
  const validatorRegistry = createSingleUseValidatorRegistry()

  return getExampleFormPairs().map(({ formDefinition, exampleForm }) => {
    const render = (withHtmlBodyTags: boolean) =>
      renderSummaryEmail({
        formSummary: getFormSummary({
          formDefinition,
          formDataJson: exampleForm.formData,
          validatorRegistry,
        }),
        serverFiles: exampleForm.serverFiles,
        fileIdInfoMap: Object.fromEntries(
          (exampleForm.serverFiles ?? []).map((file) => [
            file.id,
            { url: `https://example.com/${file.id}`, fileName: `${file.id}.pdf` },
          ]),
        ),
        validatorRegistry,
        withHtmlBodyTags,
      })

    return {
      path: ['forms', 'summary-email', toSlug(exampleForm.name)],
      renderDocument: () => render(true),
      renderTextSnapshots: async () => ({ 'fragment.html': await render(false) }),
      isScreenshotProject: (projectName) =>
        projectName.startsWith('chromium-') && projectName.endsWith('-light'),
    }
  })
}

export const emailCases: EmailCase[] = [...summaryEmailCases()]
