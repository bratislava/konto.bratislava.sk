import { Module } from '@nestjs/common'

import ConvertModule from '../convert/convert.module'
import FilesModule from '../files/files.module'
import FormsModule from '../forms/forms.module'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import ConvertPdfService from './convert-pdf.service'
import { MinioStorageModule } from '../minio-storage/minio-storage.module'

@Module({
  imports: [FormsModule, ConvertModule, FilesModule, MinioStorageModule],
  providers: [ConvertPdfService, ThrowerErrorGuard],
  exports: [ConvertPdfService],
})
export default class ConvertPdfModule {}
