import { Global, Module } from '@nestjs/common'

import { MinioClientService } from './minio-client.service'

@Global()
@Module({
  providers: [MinioClientService],
  exports: [MinioClientService],
})
export class MinioClientModule {}
