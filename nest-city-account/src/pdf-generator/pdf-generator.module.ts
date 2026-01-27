import { Module } from '@nestjs/common'
import { PdfGeneratorService } from './pdf-generator.service'
import ThrowerErrorGuard from '../utils/guards/errors.guard'

@Module({
  providers: [PdfGeneratorService, ThrowerErrorGuard],
  exports: [PdfGeneratorService],
})
export class PdfGeneratorModule {}
