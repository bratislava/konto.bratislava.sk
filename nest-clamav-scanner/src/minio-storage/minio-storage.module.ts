import { Module } from '@nestjs/common'

import { MinioStorageService } from './minio-storage.service'

@Module({
  providers: [MinioStorageService],
  exports: [MinioStorageService],
})
export class MinioStorageModule {}
