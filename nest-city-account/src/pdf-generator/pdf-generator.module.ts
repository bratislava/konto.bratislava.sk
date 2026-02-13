import { Module } from '@nestjs/common'
import { PdfGeneratorService } from './pdf-generator.service'
import { SharedModule } from '../utils/subservices/shared.module'

@Module({
  imports: [SharedModule],
  providers: [PdfGeneratorService],
  exports: [PdfGeneratorService],
})
export class PdfGeneratorModule {}
