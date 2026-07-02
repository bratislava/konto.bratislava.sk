import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Client } from 'minio'

@Injectable()
export class MinioClientService {
  private readonly minioClient: Client

  constructor(configService: ConfigService) {
    const port = Number(configService.get('MINIO_PORT', ''))

    this.minioClient = new Client({
      endPoint: configService.get('MINIO_ENDPOINT', ''),
      port: Number.isNaN(port) ? undefined : port,
      useSSL: configService.get('MINIO_USE_SSL') === 'true',
      accessKey: configService.get('MINIO_ACCESS_KEY', ''),
      secretKey: configService.get('MINIO_SECRET_KEY', ''),
      pathStyle: configService.get('MINIO_PATH_STYLE') === 'true',
    })
  }

  public client() {
    return this.minioClient
  }
}
