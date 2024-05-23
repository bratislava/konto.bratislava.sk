import { Module } from '@nestjs/common'

import ScannerClientModule from '../scanner-client/scanner-client.module'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import MinioClientSubservice from '../utils/subservices/minio-client.subservice'
import StatusController from './status.controller'
import StatusService from './status.service'

@Module({
  imports: [ScannerClientModule],
  controllers: [StatusController],
  providers: [StatusService, MinioClientSubservice, ThrowerErrorGuard],
})
export default class StatusModule {}
