import { Module } from '@nestjs/common'

import ConvertModule from '../convert/convert.module'
import FilesModule from '../files/files.module'
import FormsModule from '../forms/forms.module'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import MinioClientSubservice from '../utils/subservices/minio-client.subservice'
import ConvertPdfService from './convert-pdf.service'

@Module({
  imports: [FormsModule, ConvertModule, FilesModule],
  providers: [ConvertPdfService, MinioClientSubservice, ThrowerErrorGuard],
  exports: [ConvertPdfService],
})
export default class ConvertPdfModule {}
