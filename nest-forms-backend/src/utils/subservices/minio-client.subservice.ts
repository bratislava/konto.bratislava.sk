import { Readable, Stream } from 'node:stream'

import { Injectable } from '@nestjs/common'
import { BucketItemStat } from 'minio'
import { MinioClient, MinioService } from 'nestjs-minio-client'

import { BufferedFileDto } from '../../files/files.dto'
import {
  FilesErrorsEnum,
  FilesErrorsResponseEnum,
} from '../../files/files.errors.enum'
import { ErrorsEnum } from '../global-enums/errors.enum'
import ThrowerErrorGuard from '../guards/thrower-error.guard'
import { LineLoggerSubservice } from './line-logger.subservice'

interface UploadedObjectInfo {
  etag: string
  versionId: string | null
}

@Injectable()
export default class MinioClientSubservice {
  private readonly logger: LineLoggerSubservice

  constructor(
    private readonly minioService: MinioService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
  ) {
    this.logger = new LineLoggerSubservice('MinioClientSubservice')
  }

  public client(): MinioClient {
    this.logger.log('MinioClientSubservice.client')
    return this.minioService.client
  }

  // function which checks if bucket exists in minio bucket
  public async bucketExists(bucketName: string): Promise<boolean> {
    try {
      return await this.minioService.client.bucketExists(bucketName)
    } catch (error) {
      this.logger.error(error)
      return false
    }
  }

  // function which loads file stream from minio bucket
  public async loadFileStream(
    bucketName: string,
    fileName: string,
  ): Promise<Stream> {
    return this.minioService.client.getObject(bucketName, fileName)
  }

  // function which lists all files in minio bucket
  public async listFiles(
    bucketName: string,
    path: string,
  ): Promise<string[] | false> {
    this.logger.debug(`Listing files in bucket ${bucketName} in path ${path}`)

    try {
      let files: Array<string> = await new Promise((resolve, reject) => {
        const objectsListTemp: Array<string> = []
        const stream = this.minioService.client.listObjectsV2(
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
  ): Promise<UploadedObjectInfo | false> {
    // create folder in minio bucket in desired path
    try {
      return await this.minioService.client.putObject(
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
  public async deleteFolder(
    bucket: string,
    path: string,
  ): Promise<false | void> {
    // delete folder in mino bucket in desired path
    try {
      return await this.minioService.client.removeObject(bucket, path)
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
  public async deleteFile(bucket: string, path: string): Promise<false | void> {
    // delete file in mino bucket in desired path
    return this.deleteFolder(bucket, path)
  }

  // function which checks if file exists in minio bucket
  public async fileExists(
    bucketName: string,
    fileName: string,
  ): Promise<BucketItemStat | false> {
    try {
      return await this.minioService.client.statObject(bucketName, fileName)
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
  ): Promise<UploadedObjectInfo> {
    try {
      return await this.minioService.client.putObject(
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
    ...props: Parameters<MinioClient['putObject']>
  ): Promise<UploadedObjectInfo> {
    return this.minioService.client.putObject(...props)
  }

  // get stream of file from minio bucket
  public async download(
    bucketName: string,
    fileName: string,
  ): Promise<Readable> {
    try {
      const result: Readable = await this.minioService.client.getObject(
        bucketName,
        fileName,
      )
      return result
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
