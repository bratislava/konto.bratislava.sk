import { createHash } from 'node:crypto'

import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Files, FileStatus, Forms, Prisma } from '@prisma/client'
import { isSlovenskoSkFormDefinition } from 'forms-shared/definitions/formDefinitionTypes'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'
import { BucketItemStat } from 'minio'
import traverse from 'traverse'
import { validate as validateUuid, version as uuidVersion } from 'uuid'

import { isValidScanStatus } from '../common/utils/helpers'
import {
  FormsErrorsEnum,
  FormsErrorsResponseEnum,
} from '../forms/forms.errors.enum'
import PrismaService from '../prisma/prisma.service'
import PostScanFileResponseDto, { GetScanFileDto } from '../scanner-client/scanner-client.dto'
import ScannerClientService from '../scanner-client/scanner-client.service'
import {
  ErrorsEnum,
  ErrorsResponseEnum,
} from '../utils/global-enums/errors.enum'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import MinioClientSubservice from '../utils/subservices/minio-client.subservice'
import { BasicFileDto, BufferedFileDto, FormInfo } from './files.dto'
import { FilesErrorsEnum, FilesErrorsResponseEnum } from './files.errors.enum'

// TODO missing tests
@Injectable()
export default class FilesHelper {
  private readonly logger: Logger

  private readonly supportedMimeTypes: string[]

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private minioClientSubervice: MinioClientSubservice,
    private scannerClientService: ScannerClientService,
    private throwerErrorGuard: ThrowerErrorGuard,
  ) {
    this.logger = new Logger('FilesHelper')
    const mimeTypeList: string = <string>(
      this.configService.get(`MIMETYPE_WHITELIST`)
    )
    this.supportedMimeTypes = mimeTypeList.split(' ')
  }

  isSupportedMimeType(mimeType: string): boolean {
    return this.supportedMimeTypes.includes(mimeType)
  }

  /**
   * To be used when a file is PUT into minio which may override existing file.
   * Matches the file by formId and minioFileName, either creates new db record or updates the correct existing one.
   *
   * @param formId to which form the file belongs
   * @param pospId TODO find out why we need this on files?
   * @param minioFileName name of the file in minio bucket
   * @param fileName display name, stored only in db
   * @param fileSize TODO in db today, consider pulling this info from minio
   * @param status of the file (virus-scanning)
   * @returns created file
   */
  async upsertFileByUid(
    minioFileName: string,
    fileName: string,
    fileSize: number,
    status: FileStatus,
    formId: string,
    pospId: string,
  ): Promise<Files> {
    const existingFiles = await this.prisma.files.findMany({
      where: {
        formId,
        minioFileName,
      },
    })
    if (existingFiles.length > 1) {
      // shouldn't be possible to store 2 files with same minioFileName and formId in minio - db inconsistency
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.DATABASE_ERROR,
        `Multiple files with the same minioFileName: ${minioFileName} for formId: ${formId}`,
      )
    } else if (existingFiles.length === 1) {
      return this.prisma.files.update({
        where: {
          id: existingFiles[0].id,
        },
        data: {
          fileName,
          fileSize,
          status,
          pospId,
        },
      })
    } else {
      // no files found, create new
      return this.prisma.files.create({
        data: {
          formId,
          pospId,
          minioFileName,
          fileName,
          fileSize,
          status,
        },
      })
    }
  }

  async saveFileToDatabase(
    fileId: string,
    minioFileName: string,
    fileName: string,
    fileSize: number,
    formId: string,
    pospId: string,
  ): Promise<Files> {
    // if file does not exist in the database, save it
    const createData: Prisma.FilesCreateArgs = {
      data: {
        minioFileName,
        fileSize,
        fileName,
        formId,
        pospId,
      },
    }

    // if desired fileId is provided, use it
    if (fileId) {
      createData.data = {
        id: fileId,
        ...createData.data,
      }
    }

    try {
      return await this.prisma.files.create(createData)
    } catch (error) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.DATABASE_ERROR,
        `Error while saving file to database. Error: ${<string>error}`,
      )
    }
  }

  async checkIfFileExistsInDatabase(fileId: string): Promise<Files | null> {
    try {
      return await this.prisma.files.findFirst({
        where: {
          id: fileId,
        },
      })
    } catch (error) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.DATABASE_ERROR,
        `Unable to obtain file by fileId: ${fileId}  Error: ${<string>error}`,
      )
    }
  }

  async findFileInDatabase(
    minioFileName: string,
    formInfo: FormInfo,
  ): Promise<Files | null> {
    try {
      return await this.prisma.files.findFirst({
        where: {
          AND: [
            {
              formId: formInfo.formId,
            },
            {
              minioFileName,
            },
          ],
        },
      })
    } catch (error) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.DATABASE_ERROR,
        `Unable to obtain files for formId: ${
          formInfo.formId
        } with minioFileName: ${minioFileName}  Error: ${<string>error}`,
      )
    }
  }

  async isFileInForm(fileId: string, formId: string): Promise<boolean> {
    try {
      const file = await this.prisma.files.findFirst({
        where: {
          AND: [
            {
              id: fileId,
            },
            {
              formId,
            },
          ],
        },
      })
      return !!file
    } catch (error) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.DATABASE_ERROR,
        `Unable to obtain files for formId: ${formId} with fileId: ${fileId}  Error: ${<
          string
        >error}`,
      )
    }
  }

  async notifyScannerClient(
    minioFileName: string,
    formInfo: FormInfo,
  ): Promise<PostScanFileResponseDto | undefined> {
    const path = `${this.getPath(formInfo)}${minioFileName}`

    this.logger.log(`Sending file ${path} to scanner...`)
    const responseScanner = await this.scannerClientService.scanFile(
      path,
      this.getBucketUid(),
      formInfo.userExternalId,
    )

    if (responseScanner) {
      this.logger.log(
        `File ${responseScanner.minioFileName} with scannerId: ${responseScanner.id} was ${responseScanner.status} for scanning.`,
      )
    }

    return responseScanner
  }

  async updateFile(
    savedFile: Files,
    scannerResponse: PostScanFileResponseDto,
  ): Promise<Files> {
    if (!isValidScanStatus(scannerResponse.status)) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        FilesErrorsEnum.FILE_WRONG_STATUS_NOT_ACCEPTED_ERROR,
        FilesErrorsResponseEnum.FILE_WRONG_STATUS_NOT_ACCEPTED_ERROR,
      )
    }

    try {
      return await this.prisma.files.update({
        where: {
          id: savedFile.id,
        },
        data: {
          status: scannerResponse.status,
          scannerId: scannerResponse.id,
        },
      })
    } catch (error) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.DATABASE_ERROR,
        `${ErrorsResponseEnum.DATABASE_ERROR}. Error: ${<string>error}`,
      )
    }
  }

  async checkIfFileExistsInMinio(
    minioFileName: string,
    formInfo: FormInfo,
  ): Promise<BucketItemStat | false> {
    // slash between path and minioFileName is provided by getPath function
    const filepath = `${this.getPath(formInfo)}${minioFileName}`
    try {
      this.logger.debug(`Checking if file exists in minio: ${filepath}`)
      return await this.minioClientSubervice.fileExists(
        this.getBucketUid(),
        filepath,
      )
    } catch (error) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        FilesErrorsEnum.FILE_MINIO_CHECK_ERROR,
        `${FilesErrorsResponseEnum.FILE_MINIO_CHECK_ERROR} Error: ${<string>(
          error
        )}`,
      )
    }
  }

  getPath(formInfo: FormInfo): string {
    return `/${formInfo.pospId}/${formInfo.formId}/`
  }

  // optional status
  getBucketUid(status?: string): string {
    if (status === 'SAFE') {
      return <string>this.configService.get('MINIO_SAFE_BUCKET')
    }
    if (status === 'INFECTED') {
      return <string>this.configService.get('MINIO_INFECTED_BUCKET')
    }

    return <string>this.configService.get('MINIO_UNSCANNED_BUCKET')
  }

  forms2formInfo(form: Forms): FormInfo {
    const formDefinition = getFormDefinitionBySlug(form.formDefinitionSlug)
    if (!formDefinition) {
      throw this.throwerErrorGuard.NotFoundException(
        FormsErrorsEnum.FORM_DEFINITION_NOT_FOUND,
        `${FormsErrorsResponseEnum.FORM_DEFINITION_NOT_FOUND} ${form.formDefinitionSlug}`,
      )
    }

    // TODO: Remove this, it is only needed because of `formDefinition.pospID`. When migrating to non-Slovensko.sk forms,
    // different identifier must be used.
    if (!isSlovenskoSkFormDefinition(formDefinition)) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        FormsErrorsEnum.FORM_DEFINITION_NOT_SUPPORTED_TYPE,
        `${FormsErrorsResponseEnum.FORM_DEFINITION_NOT_SUPPORTED_TYPE} ${form.formDefinitionSlug}`,
      )
    }

    return {
      pospId: formDefinition.pospID,
      formId: form.id,
    }
  }

  fileDto2formInfo(files: BasicFileDto): FormInfo {
    return {
      pospId: files.pospId,
      formId: files.formId,
    }
  }

  createMinioFileName(file: BufferedFileDto, fileName: string): string {
    const timestamp = Date.now().toString()
    const hash = createHash('sha1').update(timestamp).digest('hex').slice(0, 8)
    const extension = file.originalname.slice(
      file.originalname.lastIndexOf('.'),
      file.originalname.length,
    )
    return `${fileName}-${hash}${extension}`
  }

  async getFileUuidsFromDatabase(formId: string): Promise<string[]> {
    let files
    try {
      files = await this.prisma.files.findMany({
        where: {
          formId,
        },
        select: {
          id: true,
        },
      })
    } catch (error) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.DATABASE_ERROR,
        `Error while checking if file exists in the database. Error: ${<string>(
          error
        )}`,
      )
    }
    const uuids: string[] = []
    files.forEach((file) => {
      uuids.push(file.id)
    })
    return uuids
  }

  /**
   * Extracts used file UUIDs from form data.
   *
   * This is a naive implementation that extracts all the valid UUIDs, but is very performant compared
   * to the "normal" version.
   */
  getAllFileUuidsFromJson(formDataJson: Prisma.JsonObject): string[] {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,unicorn/no-array-reduce,@typescript-eslint/no-unsafe-member-access
    return traverse(formDataJson).reduce(function traverseFn(
      acc: string[],
      value,
    ) {
      if (
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        this.isLeaf &&
        typeof value === 'string' &&
        validateUuid(value) &&
        uuidVersion(value) === 4
      ) {
        acc.push(value)
      }
      return acc
    }, []) as string[]
  }

  /*
  Sends request to nest-clamav-scanner to delete file from scanner database, so the file will not be scanned
   */
  async deleteFileFromScannerClient(
    scannerId: string,
  ): Promise<GetScanFileDto | undefined> {
    this.logger.log(
      `Deleting file with scannerId: ${scannerId} from scanner...`,
    )

    const responseScanner =
      await this.scannerClientService.deleteFile(scannerId)

    if (responseScanner) {
      this.logger.log(
        `File with scannerId: ${scannerId} was deleted from scanner.`,
      )
    }

    return responseScanner
  }
}
