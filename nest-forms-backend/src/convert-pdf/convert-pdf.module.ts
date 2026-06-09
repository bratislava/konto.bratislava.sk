import { Module } from '@nestjs/common'

import ConvertModule from '../convert/convert.module'
import FilesModule from '../files/files.module'
import FormsModule from '../forms/forms.module'
import ConvertPdfService from './convert-pdf.service'

@Module({
  imports: [FormsModule, ConvertModule, FilesModule],
  providers: [ConvertPdfService],
  exports: [ConvertPdfService],
})
export default class ConvertPdfModule {}
