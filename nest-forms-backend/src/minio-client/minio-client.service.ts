import { Injectable } from '@nestjs/common'
import { Client, ClientOptions } from 'minio'

import BaConfigService from '../config/ba-config.service'

@Injectable()
export class MinioClientService {
  private readonly minioClient: Client

  constructor(baConfigService: BaConfigService) {
    const options: ClientOptions = {
      endPoint: baConfigService.minio.endpoint,
      port: baConfigService.minio.port,
      useSSL: baConfigService.minio.useSSL,
      accessKey: baConfigService.minio.accessKey,
      secretKey: baConfigService.minio.secretKey,
      pathStyle: baConfigService.minio.pathStyle,
    }

    this.minioClient = new Client(options)
  }

  public client(): Client {
    return this.minioClient
  }
}
