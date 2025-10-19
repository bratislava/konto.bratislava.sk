import { Module } from '@nestjs/common'
import { MailgunService } from './mailgun.service'
import { PdfConverterModule } from './pdf-converter/pdf-converter.module';
import {MailgunController} from "./mailgun.controller";

@Module({
  providers: [MailgunService],
  exports: [MailgunService],
  imports: [PdfConverterModule],
  controllers: [MailgunController],
})
export class MailgunModule {}
