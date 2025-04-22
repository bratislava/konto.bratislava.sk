import { Module } from '@nestjs/common'

import UserInfoPipeModule from '../auth/decorators/user-info-pipe.module'
import FormsHelper from '../forms/forms.helper'
// eslint-disable-next-line import/no-cycle
import FormsModule from '../forms/forms.module'
import NasesConsumerHelper from '../nases-consumer/nases-consumer.helper'
import PrismaModule from '../prisma/prisma.module'
import ScannerClientModule from '../scanner-client/scanner-client.module'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import MinioClientSubservice from '../utils/subservices/minio-client.subservice'
import FilesController from './files.controller'
import FilesHelper from './files.helper'
import FilesService from './files.service'

@Module({
  imports: [PrismaModule, FormsModule, ScannerClientModule, UserInfoPipeModule],
  providers: [
    FilesService,
    FilesHelper,
    FormsHelper,
    ThrowerErrorGuard,
    NasesConsumerHelper,
    MinioClientSubservice,
  ],
  exports: [FilesService, FilesHelper],
  controllers: [FilesController],
})
export default class FilesModule {}
