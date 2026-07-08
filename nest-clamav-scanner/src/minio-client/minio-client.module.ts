import { Global, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { MinioClientService } from './minio-client.service'

@Global()
@Module({
  imports: [ConfigModule],
  providers: [MinioClientService],
  exports: [MinioClientService],
})
export class MinioClientModule {}
