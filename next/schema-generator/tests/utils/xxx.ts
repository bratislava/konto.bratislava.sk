import { pdfToPng, PngPageOutput } from 'pdf-to-png-converter'

test(`Convert PDF To PNG`, async () => {
  const pngPages: PngPageOutput[] = await pdfToPng(
    'C:\\Projects\\konto.bratislava.sk\\next\\schema-generator\\tests\\utils\\test.pdf',
    {
      outputFileMask: 'buffer',
    },
  )

  // Assuming you want to test all converted pages
  pngPages.forEach((page) => {
    expect(page.content).toMatchImageSnapshot({
      customSnapshotIdentifier: `page-${page.pageNumber}`,
    })
  })
})
