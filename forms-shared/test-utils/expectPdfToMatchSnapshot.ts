import { expect, vi } from 'vitest'
import { toMatchImageSnapshot } from 'jest-image-snapshot'
import { VerbosityLevel } from 'pdfjs-dist'
// "pdf-to-img" is not the most popular package, but it is one of the few that use PDF.js internally and doesn't
// need any native binaries, so it works out of the box without complex local / CI setup.
import { pdf } from 'pdf-to-img'

expect.extend({ toMatchImageSnapshot })

type PdfInput = Parameters<typeof pdf>[0]

/**
 * Converts each page of the provided PDF file into an image and compares it against a stored snapshot for visual
 * regression testing. Wrapped with `defineHelper` so failures point at the call site in the test file.
 */
export const expectPdfToMatchSnapshot = vi.defineHelper(async (input: PdfInput) => {
  const outputPages = await pdf(input, {
    scale: 2, // without scale the PDFs are too small
    docInitParams: {
      // Suppresses the warning:
      // `Warning: _getAppearance: OffscreenCanvas is not supported, annotation may not render correctly.`
      verbosity: VerbosityLevel.ERRORS,
    },
  })

  for await (const page of outputPages) {
    expect(page).toMatchImageSnapshot({
      customDiffConfig: {
        threshold: 0.05,
      },
    })
  }
})
