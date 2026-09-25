import path from 'node:path'

import { Injectable, OnApplicationShutdown } from '@nestjs/common'
import { GenerateTaxPdfPayload } from 'forms-shared/tax-form/generateTaxPdf'
import Piscina from 'piscina'

@Injectable()
export default class TaxService implements OnApplicationShutdown {
  private readonly pdfPool: Piscina<GenerateTaxPdfPayload, string>

  constructor() {
    this.pdfPool = new Piscina({
      filename: path.join(__dirname, 'worker.js'),
    })
  }

  // Runs after the HTTP server has drained, so in-flight PDF requests finish.
  onApplicationShutdown(): void {
    void this.pdfPool.destroy()
  }

  async getFilledInPdfBase64(
    formData: PrismaJson.FormDataJson,
    formId: string,
  ): Promise<string> {
    /* Generating tax PDF is resource intensive. The generation usually takes ~3 seconds. Only a handful of concurrent
     * tasks completely block the main thread. */
    return this.pdfPool.run({
      formData,
      formId,
    })
  }
}
