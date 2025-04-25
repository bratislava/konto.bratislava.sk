import path from 'node:path'

import { Injectable, OnModuleDestroy } from '@nestjs/common'
import { GenerateTaxPdfPayload } from 'forms-shared/tax-form/generateTaxPdf'
import { TaxFormData } from 'forms-shared/tax-form/types'
import Piscina from 'piscina'

@Injectable()
export default class TaxService implements OnModuleDestroy {
  private readonly pdfPool: Piscina<GenerateTaxPdfPayload, string>

  constructor() {
    this.pdfPool = new Piscina({
      // eslint-disable-next-line unicorn/prefer-module
      filename: path.join(__dirname, 'worker.js'),
    })
  }

  onModuleDestroy(): void {
    this.pdfPool.destroy()
  }

  async getFilledInPdfBase64(
    formData: PrismaJson.FormDataJson,
    formId: string,
  ): Promise<string> {
    return this.pdfPool.run({
      formData: formData as TaxFormData,
      formId,
    })
  }
}
