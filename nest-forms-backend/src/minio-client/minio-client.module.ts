import { Global, Module } from '@nestjs/common'

import BaConfigModule from '../config/ba-config.module'
import { MinioClientService } from './minio-client.service'

@Global()
@Module({
  imports: [BaConfigModule],
  providers: [MinioClientService],
  exports: [MinioClientService],
})
export class MinioClientModule {}
