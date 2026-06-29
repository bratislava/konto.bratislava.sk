import { Injectable } from '@nestjs/common'
import { Client } from 'minio'

import { BufferedFileDto } from '../files/files.dto'
import {
  FilesErrorsEnum,
  FilesErrorsResponseEnum,
} from '../files/files.errors.enum'
import { MinioClientService } from '../minio-client/minio-client.service'
import { ErrorsEnum } from '../utils/global-enums/errors.enum'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'


@Injectable()
export class MinioStorageService {
  private readonly logger = new LineLoggerSubservice('MinioStorageService')

  constructor(
    private readonly minioClientService: MinioClientService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
  ) {}

  public client(): Client {
    this.logger.log('MinioStorageService.client')
    return this.minioClientService.client()
  }

  // function which checks if bucket exists in minio bucket
  public async bucketExists(bucketName: string) {
    try {
      return await this.minioClientService.client().bucketExists(bucketName)
    } catch (error) {
      this.logger.error(error)
      return false
    }
  }

  // function which loads file stream from minio bucket
  public async loadFileStream(
    bucketName: string,
    fileName: string,
  ) {
    return this.minioClientService.client().getObject(bucketName, fileName)
  }

  // function which lists all files in minio bucket
  public async listFiles(
    bucketName: string,
    path: string,
  ) {
    this.logger.debug(`Listing files in bucket ${bucketName} in path ${path}`)

    try {
      let files: string[] = await new Promise((resolve, reject) => {
        const objectsListTemp: string[] = []
        const stream = this.minioClientService.client().listObjectsV2(
          bucketName,
          path,
          true /* recursive */,
        )

        stream.on('data', (obj) => {
          if (obj.name) objectsListTemp.push(obj.name)
        })
        stream.on('error', reject)
        stream.on('end', () => {
          resolve(objectsListTemp)
        })
      })

      if (Array.isArray(files)) {
        // remove folders from array
        // eslint-disable-next-line sonarjs/null-dereference
        files = files.filter((file) => !file.endsWith('/'))
      }
      this.logger.debug(files)

      return files
    } catch (error) {
      this.logger.error(error)
      return false
    }
  }

  public async createFolder(
    bucket: string,
    path: string,
  ) {
    // create folder in minio bucket in desired path
    try {
      return await this.minioClientService.client().putObject(
        bucket,
        path,
        Buffer.from(''),
        0,
      )
    } catch (error) {
      this.logger.error(
        this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          `Error creating folder in bucket.`,
          { path, bucket },
          error,
        ),
      )
      return false
    }
  }

  // function which deletes folder in minio bucket
  public async deleteFolder(bucket: string, path: string) {
    // delete folder in mino bucket in desired path
    try {
      await this.minioClientService.client().removeObject(bucket, path)
      return true
    } catch (error) {
      this.logger.error(
        this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          'Error while deleting a folder in minio',
          undefined,
          error,
        ),
      )
      return false
    }
  }

  // function which deletes file in minio bucket
  public async deleteFile(bucket: string, path: string) {
    // delete file in mino bucket in desired path
    return this.deleteFolder(bucket, path)
  }

  // function which checks if file exists in minio bucket
  public async fileExists(
    bucketName: string,
    fileName: string,
  ) {
    try {
      return await this.minioClientService.client().statObject(bucketName, fileName)
    } catch (error) {
      this.logger.error(
        `File: ${fileName} does not exist in bucket: ${bucketName}`,
      )
      this.logger.error(error)
      return false
    }
  }

  public async upload(
    file: BufferedFileDto,
    pathWithMinioFileName: string,
    bucketName: string,
  ) {
    try {
      return await this.minioClientService.client().putObject(
        bucketName,
        pathWithMinioFileName,
        file.buffer,
      )
    } catch (error) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        FilesErrorsEnum.FILE_UPLOAD_TO_MINIO_WAS_NOT_SUCCESSFUL_ERROR,
        FilesErrorsResponseEnum.FILE_UPLOAD_TO_MINIO_WAS_NOT_SUCCESSFUL_ERROR,
        undefined,
        error,
      )
    }
  }

  // TODO refactor/consider removing whole subservice, this is a helper until then
  // satisfying types for the upload fn above was hard and not helping anything
  public async putObject(
    ...props: Parameters<Client['putObject']>
  ) {
    return this.minioClientService.client().putObject(...props)
  }

  // get stream of file from minio bucket
  public async download(
    bucketName: string,
    fileName: string,
  ) {
    try {
      return await this.minioClientService
        .client()
        .getObject(bucketName, fileName)
    } catch (error) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        FilesErrorsEnum.FILE_DOWNLOAD_FROM_MINIO_WAS_NOT_SUCCESSFUL_ERROR,
        FilesErrorsResponseEnum.FILE_DOWNLOAD_FROM_MINIO_WAS_NOT_SUCCESSFUL_ERROR,
        undefined,
        error,
      )
    }
  }
}
