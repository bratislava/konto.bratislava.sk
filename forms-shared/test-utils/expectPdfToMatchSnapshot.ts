import { expect } from 'vitest'
import { toMatchImageSnapshot } from 'jest-image-snapshot'

// "pdf-to-img" is not the most popular package, but it is one of the few that use PDF.js internally and doesn't
// need any native binaries, so it works out of the box without complex local / CI setup.
import { pdf } from 'pdf-to-img'

expect.extend({ toMatchImageSnapshot })

type PdfInput = Parameters<typeof pdf>[0]

/**
 * Converts each page of the provided PDF file into an image and compares it against a stored snapshot for visual
 * regression testing.
 */
export const expectPdfToMatchSnapshot = async (input: PdfInput) => {
  const outputPages = await pdf(input, {
    scale: 2, // without scale the PDFs are too small
  })

  for await (const page of outputPages) {
    expect(page).toMatchImageSnapshot({
      customDiffConfig: {
        threshold: 0.05,
      }
    })
  }
}
