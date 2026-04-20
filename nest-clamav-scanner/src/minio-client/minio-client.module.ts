import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MinioModule } from 'nestjs-minio-client'

import { MinioClientService } from './minio-client.service'

@Module({
  imports: [
    MinioModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        endPoint: configService.get('MINIO_ENDPOINT', ''),
        port: parseInt(configService.get('MINIO_PORT', '')),
        useSSL: configService.get('MINIO_USE_SSL') === 'true',
        accessKey: configService.get('MINIO_ACCESS_KEY', ''),
        secretKey: configService.get('MINIO_SECRET_KEY', ''),
        pathStyle: configService.get('MINIO_PATH_STYLE') === 'true',
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MinioClientService],
  exports: [MinioClientService],
})
export class MinioClientModule {}
