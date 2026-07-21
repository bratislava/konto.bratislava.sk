import { Module } from '@nestjs/common'

import { MinioStorageModule } from '../minio-storage/minio-storage.module'
import ScannerClientModule from '../scanner-client/scanner-client.module'
import StatusController from './status.controller'
import StatusService from './status.service'

@Module({
  imports: [ScannerClientModule, MinioStorageModule],
  controllers: [StatusController],
  providers: [StatusService],
})
export default class StatusModule {}
