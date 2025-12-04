import { Module } from '@nestjs/common'
import { PdfConverterService } from './pdf-converter.service'

@Module({
  providers: [PdfConverterService],
  exports: [PdfConverterService],
})
export class PdfConverterModule {}
