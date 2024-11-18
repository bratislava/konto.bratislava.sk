import { forwardRef, Module } from '@nestjs/common'

// eslint-disable-next-line import/no-cycle
import FilesModule from '../files/files.module'
import FilesService from '../files/files.service'
import NasesConsumerHelper from '../nases-consumer/nases-consumer.helper'
import PrismaModule from '../prisma/prisma.module'
import ScannerClientModule from '../scanner-client/scanner-client.module'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import MinioClientSubservice from '../utils/subservices/minio-client.subservice'
import FormsController from './forms.controller'
import FormsHelper from './forms.helper'
import FormsService from './forms.service'
import FormsTaskSubservice from './subservices/forms-task.subservice'

@Module({
  imports: [PrismaModule, ScannerClientModule, forwardRef(() => FilesModule)],
  providers: [
    FormsService,
    FormsHelper,
    FilesService,
    NasesConsumerHelper,
    ThrowerErrorGuard,
    MinioClientSubservice,
    FormsTaskSubservice,
  ],
  exports: [FormsService, FormsHelper],
  controllers: [FormsController],
})
export default class FormsModule {}
