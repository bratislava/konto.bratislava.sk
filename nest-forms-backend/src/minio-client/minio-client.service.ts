import { Injectable } from '@nestjs/common'
import { Client } from 'minio'

import BaConfigService from '../config/ba-config.service'

@Injectable()
export class MinioClientService {
  private readonly minioClient: Client

  constructor(baConfigService: BaConfigService) {
    this.minioClient = new Client({
      endPoint: baConfigService.minio.endpoint,
      port: baConfigService.minio.port,
      useSSL: baConfigService.minio.useSSL,
      accessKey: baConfigService.minio.accessKey,
      secretKey: baConfigService.minio.secretKey,
      pathStyle: baConfigService.minio.pathStyle,
    })
  }

  public client(): Client {
    return this.minioClient
  }
}
