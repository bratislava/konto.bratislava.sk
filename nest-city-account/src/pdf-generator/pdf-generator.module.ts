import { Module } from '@nestjs/common'

import { PdfGeneratorService } from './pdf-generator.service'

@Module({
  providers: [PdfGeneratorService],
  exports: [PdfGeneratorService],
})
export class PdfGeneratorModule {}
