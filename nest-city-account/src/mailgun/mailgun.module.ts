import { Module } from '@nestjs/common'
import { MailgunService } from './mailgun.service'
import { MailgunMessageBuilder } from './mailgun-message.builder'
import { PdfGeneratorModule } from '../pdf-generator/pdf-generator.module'
import {SharedModule} from "../utils/subservices/shared.module";

@Module({
  imports: [PdfGeneratorModule, SharedModule],
  providers: [MailgunService, MailgunMessageBuilder],
  exports: [MailgunService],
})
export class MailgunModule {}
