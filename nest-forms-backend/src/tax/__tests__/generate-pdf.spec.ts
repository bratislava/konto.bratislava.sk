import fs from 'node:fs'

import generateTaxPdf from '../../utils/tax/tax-pdf-mapping/generateTaxPdf'
import sampleFormData from './example-form-data'

jest.mock('../../files/files.service')

describe('ConvertPdfService', () => {
  // let taxService: TaxService
  // const putObject = jest.fn()
  // putObject.mockResolvedValue(true)
  // const generatePdf = jest.fn()
  // generatePdf.mockResolvedValue(true)
  //
  // beforeEach(async () => {
  //   const module: TestingModule = await Test.createTestingModule({
  //     providers: [TaxService, ThrowerErrorGuard],
  //   }).compile()
  //   taxService = module.get<TaxService>(TaxService)
  // })

  describe('generate-pdf-test', () => {
    it('creates example filled-in pdfs at ./pdf-output', async () => {
      let outputDirExists = false
      try {
        outputDirExists = fs.statSync('./pdf-output').isDirectory()
      } catch (error) {
        // on error assume it's because the dir doesn't exist
        outputDirExists = false
      }
      if (!outputDirExists) {
        fs.mkdirSync('./pdf-output')
      }
      const base64String = await generateTaxPdf({
        formData: sampleFormData,
        formId: 'mockId',
      })
      const pdfBuffer = Buffer.from(base64String, 'base64')
      fs.writeFileSync('./pdf-output/dummy-fill-every-field.pdf', pdfBuffer)

      expect(true).toBe(true)
    }, /* This test needs an increased timeout. */ 10_000)
  })
})
