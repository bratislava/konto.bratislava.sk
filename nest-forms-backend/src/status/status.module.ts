import { Module } from '@nestjs/common'

import { MinioStorageService } from '../minio-storage/minio-storage.service'
import ScannerClientModule from '../scanner-client/scanner-client.module'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import StatusController from './status.controller'
import StatusService from './status.service'

@Module({
  imports: [ScannerClientModule],
  controllers: [StatusController],
  providers: [StatusService, MinioStorageService, ThrowerErrorGuard],
})
export default class StatusModule {}
