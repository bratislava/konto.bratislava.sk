import { Module } from '@nestjs/common'

import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import { MinioStorageService } from './minio-storage.service'

@Module({
  providers: [MinioStorageService, ThrowerErrorGuard],
  exports: [MinioStorageService],
})
export class MinioStorageModule {}
