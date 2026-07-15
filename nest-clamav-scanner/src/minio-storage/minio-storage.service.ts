import { Injectable, Logger } from '@nestjs/common'
import { CopyConditions } from 'minio'

import { MinioClientService } from '../minio-client/minio-client.service'

@Injectable()
export class MinioStorageService {
  private readonly logger: Logger

  constructor(private readonly minioClientService: MinioClientService) {
    this.logger = new Logger('MinioStorageService')
  }

  public client() {
    this.logger.log('MinioStorageService.client')
    return this.minioClientService.client()
  }

  //function which checks if bucket exists in minio bucket
  public async bucketExists(bucketName: string) {
    try {
      return await this.minioClientService.client().bucketExists(bucketName)
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(error.message)
      } else {
        this.logger.error(
          `bucketExists is throwing non Error: ${String(error)}`,
        )
      }

      throw error
    }
  }

  //function which loads file stream from minio bucket
  public async loadFileStream(bucketName: string, fileName: string) {
    try {
      return await this.minioClientService.client().getObject(bucketName, fileName)
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(error.message)
      } else {
        this.logger.error(
          `loadFileStream is throwing non Error: ${String(error)}`,
        )
      }

      throw error
    }
  }

  //function which lists all files in minio bucket
  public async listFiles(bucketName: string) {
    try {
      return await new Promise<string[]>((resolve, reject) => {
        const objectsListTemp: string[] = []
        const stream = this.minioClientService.client().listObjectsV2(
          bucketName,
          '',
          true,
          '',
        )

        stream.on('data', (obj) => {
          if (obj.name != null) {
            objectsListTemp.push(obj.name)
          }
        })
        stream.on('error', reject)
        stream.on('end', () => {
          resolve(objectsListTemp)
        })
      })
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(error.message)
      } else {
        this.logger.error(`listFiles is throwing non Error: ${String(error)}`)
      }

      throw error
    }
  }

  //function which checks if file exists in minio bucket
  public async fileExists(
    bucketName: string,
    fileName: string,
  ) {
    try {
      return await this.minioClientService.client().statObject(bucketName, fileName)
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(error.message)
      } else {
        this.logger.error(`fileExists is throwing non Error: ${String(error)}`)
      }

      throw error
    }
  }

  //function which moves file from one bucket to another
  public async moveFileBetweenBuckets(
    sourceBucketName: string,
    sourceFileName: string,
    destinationBucketName: string,
    destinationFileName: string,
  ) {
    this.logger.debug(
      `Moving file ${sourceFileName} from bucket ${sourceBucketName} to bucket ${destinationBucketName} with name ${destinationFileName}`,
    )

    try {
      await this.minioClientService.client().copyObject(
        destinationBucketName,
        destinationFileName,
        `/${sourceBucketName}/${sourceFileName}`,
        new CopyConditions(),
      )
    } catch (error) {
      const errString =
        error instanceof Error
          ? error.message
          : `throwing non Error: ${String(error)}`
      this.logger.error(
        `Error while moving file ${sourceFileName} from bucket ${sourceBucketName} to bucket ${destinationBucketName} with name ${destinationFileName}. Error: ${errString}`,
      )
      return false
    }

    try {
      await this.minioClientService.client().removeObject(
        sourceBucketName,
        sourceFileName,
      )
    } catch (error) {
      const errString =
        error instanceof Error
          ? error.message
          : `throwing non Error: ${String(error)}`
      this.logger.error(
        `Error while removing file ${sourceFileName} from bucket ${sourceBucketName}. Error: ${errString}`,
      )
      return false
    }

    return true
  }
}
