import { Module } from '@nestjs/common'

import { ClamavClientModule } from '../clamav-client/clamav-client.module'
import { FormsClientModule } from '../forms-client/forms-client.module'
import { MinioStorageModule } from '../minio-storage/minio-storage.module'
import { StatusController } from './status.controller'
import { StatusService } from './status.service'

@Module({
  imports: [MinioStorageModule, ClamavClientModule, FormsClientModule],
  controllers: [StatusController],
  providers: [StatusService],
})
export class StatusModule {}
