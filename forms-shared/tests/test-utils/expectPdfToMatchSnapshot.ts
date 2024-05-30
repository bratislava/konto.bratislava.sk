import { toMatchImageSnapshot } from 'jest-image-snapshot'

// "pdf-to-img" is not the most popular package, but it is one of the few that use PDF.js internally and doesn't
// need any native binaries, so it works out of the box without complex local / CI setup.
import { pdf } from 'pdf-to-img'

expect.extend({ toMatchImageSnapshot })

type PdfInputType = Parameters<typeof pdf>[0]

export const expectPdfToMatchSnapshot = async (pdfFile: PdfInputType) => {
  const outputPages = await pdf(pdfFile, {
    scale: 2, // without scale the PDFs are too small
  })

  for await (const page of outputPages) {
    expect(page).toMatchImageSnapshot()
  }
}
