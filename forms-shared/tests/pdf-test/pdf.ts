import * as path from 'node:path'

import { toMatchImageSnapshot } from 'jest-image-snapshot'

import { pdf } from 'pdf-to-img'
import fs from 'node:fs'
import { ParseSpeeds, PDFDocument } from 'pdf-lib'

expect.extend({ toMatchImageSnapshot })

describe('pdf', () => {
  it('should convert pdf to image', async () => {
    const outputImages2 = await pdf(path.join(__dirname, './pdf-output.pdf'), {
      scale: 2,
    })

    for await (const page of outputImages2) {
      expect(page).toMatchImageSnapshot()
    }
  })

  it('adas', async () => {
    const pdfBytes = fs.readFileSync(
      'C:\\Projects\\konto.bratislava.sk\\forms-shared\\src\\tax-form\\Priznanie_komplet_tlacivo.pdf',
    )
    const pdfDoc = await PDFDocument.load(pdfBytes, {
      parseSpeed: ParseSpeeds.Fastest,
    })
    const x = await pdfDoc.saveAsBase64()
    expect(x).toBeDefined()
  })
})
