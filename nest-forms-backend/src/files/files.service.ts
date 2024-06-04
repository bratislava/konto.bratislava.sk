import { Readable } from 'node:stream'

import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Files, FileStatus, FormError, FormState, Prisma } from '@prisma/client'
import * as jwt from 'jsonwebtoken'

import { CognitoGetUserData } from '../auth/dtos/cognito.dto'
import {
  isValidScanStatus,
  processingScanStatuses,
} from '../common/utils/helpers'
import FormsHelper from '../forms/forms.helper'
// eslint-disable-next-line import/no-cycle
import FormsService from '../forms/forms.service'
import NasesConsumerHelper from '../nases-consumer/nases-consumer.helper'
import PrismaService from '../prisma/prisma.service'
import { ErrorsEnum } from '../utils/global-enums/errors.enum'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import alertError from '../utils/logging'
import MinioClientSubservice from '../utils/subservices/minio-client.subservice'
import {
  BufferedFileDto,
  DownloadTokenResponseDataDto,
  FormDataFileDto,
  FormFilesReadyResultDto,
  FormFilesWithMinio,
  GetFileResponseDto,
  GetFileResponseReducedDto,
  PostFileResponseDto,
  UpdateFileStatusResponseDto,
} from './files.dto'
import { FilesErrorsEnum, FilesErrorsResponseEnum } from './files.errors.enum'
import FilesHelper from './files.helper'

@Injectable()
export default class FilesService {
  private readonly logger: Logger

  private readonly jwtSecret: string

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly minioClientSubervice: MinioClientSubservice,
    private readonly formsService: FormsService,
    private filesHelper: FilesHelper,
    private formsHelper: FormsHelper,
    private throwerErrorGuard: ThrowerErrorGuard,
    private readonly nasesConsumerHelper: NasesConsumerHelper,
  ) {
    this.logger = new Logger('FilesService')
    this.jwtSecret = this.configService.get('JWT_SECRET') ?? ''
  }

  async getFile(fileId: string): Promise<Files> {
    let file
    try {
      file = await this.prisma.files.findFirst({
        where: {
          id: fileId,
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

    if (!file) {
      throw this.throwerErrorGuard.NotFoundException(
        FilesErrorsEnum.FILE_NOT_FOUND_ERROR,
        `File with fileId: ${fileId} does not exist in the database.`,
      )
    }
    return file
  }

  async getFileWithUserVerify(
    fileId: string,
    ico: string | null,
    user?: CognitoGetUserData,
  ): Promise<GetFileResponseDto> {
    // get file from database
    let file
    try {
      file = await this.prisma.files.findFirst({
        where: {
          id: fileId,
        },
        include: {
          forms: true,
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
    if (!file) {
      throw this.throwerErrorGuard.NotFoundException(
        FilesErrorsEnum.FILE_NOT_FOUND_ERROR,
        `File with fileId: ${fileId} does not exist in the database.`,
      )
    }

    if (
      !this.formsHelper.isFormAccessGranted(
        file.forms,
        user ? user.sub : null,
        ico,
      )
    ) {
      throw this.throwerErrorGuard.ForbiddenException(
        FilesErrorsEnum.FILE_IS_OWNED_BY_SOMEONE_ELSE_ERROR,
        FilesErrorsResponseEnum.FILE_IS_OWNED_BY_SOMEONE_ELSE_ERROR,
      )
    }
    return file
  }

  async getFilesByForm(
    formId: string,
    ico: string | null,
    user?: CognitoGetUserData,
  ): Promise<GetFileResponseReducedDto[]> {
    await this.formsService.getFormWithAccessCheck(
      formId,
      user ? user.sub : null,
      ico,
    )

    let files
    try {
      files = await this.prisma.files.findMany({
        where: {
          formId,
        },
        select: {
          id: true,
          fileName: true,
          fileSize: true,
          status: true,
          ginisOrder: true,
          ginisUploaded: true,
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

    return files
  }

  async getMinioPathsForForm(formId: string): Promise<FormFilesWithMinio[]> {
    let files
    try {
      files = await this.prisma.files.findMany({
        where: {
          formId,
        },
        select: {
          id: true,
          pospId: true,
          minioFileName: true,
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

    return files.map((file) => ({
      minioPath: `${process.env.MINIO_SAFE_BUCKET ?? ''}/${
        file.pospId
      }/${formId}/${file.minioFileName}`,
      id: file.id,
      fileName: file.minioFileName,
    }))
  }

  async updateFileStatusScannerId(
    scannerId: string,
    status: FileStatus,
  ): Promise<UpdateFileStatusResponseDto> {
    let file: Files | null

    if (!isValidScanStatus(status)) {
      throw this.throwerErrorGuard.NotAcceptableException(
        FilesErrorsEnum.FILE_WRONG_STATUS_NOT_ACCEPTED_ERROR,
        `Invalid Files status: ${status}. Unable to save.`,
      )
    }

    file = await this.prisma.files.findFirst({
      where: {
        scannerId,
      },
    })

    if (!file) {
      throw this.throwerErrorGuard.NotFoundException(
        FilesErrorsEnum.FILE_BY_SCANNERID_NOT_FOUND_ERROR,
        `File with scannerId: ${scannerId}, does not exist in the database.`,
      )
    }

    try {
      file = await this.prisma.files.update({
        where: {
          scannerId,
        },
        data: {
          status,
        },
      })
    } catch (error) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.DATABASE_ERROR,
        `Error while updating file status in the database. Error: ${<string>(
          error
        )}`,
      )
    }

    this.logger.debug(
      `Scanner status update: File ${file.minioFileName} was updated with status: ${status}`,
    )
    return {
      ...file,
      message: `File: ${file.minioFileName} has been successfully updated with status: ${status}`,
    }
  }

  async uploadFile(
    formId: string,
    bufferedFile: BufferedFileDto,
    data: FormDataFileDto,
    ico: string | null,
    user?: CognitoGetUserData,
  ): Promise<PostFileResponseDto> {
    const userId = user ? user.sub : null
    const fileName = data.filename
    const fileId = data.id
    this.logger.log(
      `Received file upload request for form ${formId} with filename ${fileName}.`,
    )
    if (!bufferedFile) {
      throw this.throwerErrorGuard.BadRequestException(
        FilesErrorsEnum.NO_FILE_UPLOAD_DATA_ERROR,
        FilesErrorsResponseEnum.NO_FILE_UPLOAD_DATA_ERROR,
      )
    }

    if (bufferedFile.size > this.configService.get('MAX_FILE_SIZE')) {
      throw this.throwerErrorGuard.BadRequestException(
        FilesErrorsEnum.FILE_SIZE_EXCEEDED_ERROR,
        `${FilesErrorsResponseEnum.FILE_SIZE_EXCEEDED_ERROR} Received file size: ${bufferedFile.size}`,
      )
    }

    if (bufferedFile.size === 0) {
      throw this.throwerErrorGuard.BadRequestException(
        FilesErrorsEnum.FILE_SIZE_ZERO_ERROR,
        `${FilesErrorsResponseEnum.FILE_SIZE_ZERO_ERROR} Received file size: ${bufferedFile.size}`,
      )
    }

    if (!this.filesHelper.isSupportedMimeType(bufferedFile.mimetype)) {
      throw this.throwerErrorGuard.BadRequestException(
        FilesErrorsEnum.FILE_MIME_TYPE_IS_NOT_SUPPORTED_ERROR,
        `${FilesErrorsResponseEnum.FILE_MIME_TYPE_IS_NOT_SUPPORTED_ERROR} Received file mimetype: ${bufferedFile.mimetype}`,
      )
    }

    const form = await this.formsService.getFormWithAccessCheck(
      formId,
      userId,
      ico,
    )
    const maybeFile = await this.filesHelper.checkIfFileExistsInDatabase(fileId)
    if (maybeFile) {
      throw this.throwerErrorGuard.NotAcceptableException(
        FilesErrorsEnum.FILE_ID_ALREADY_EXISTS_ERROR,
        `File id ${fileId} already exists and cannot be created a new one with that id.`,
      )
    }

    const formInfo = this.filesHelper.forms2formInfo(form)
    const { pospId } = formInfo
    const filePath = this.filesHelper.getPath(formInfo)
    const minioFileName = this.filesHelper.createMinioFileName(
      bufferedFile,
      data.filename,
    )
    const fileSize = bufferedFile.size
    const pathWithMinioFileName = filePath + minioFileName

    const uploadedFile = await this.minioClientSubervice.upload(
      bufferedFile,
      pathWithMinioFileName,
      this.filesHelper.getBucketUid(),
    )
    let file: Files
    if (uploadedFile) {
      this.logger.log(
        `File ${minioFileName} was successfully uploaded to Minio.`,
      )

      file = await this.filesHelper.saveFileToDatabase(
        fileId,
        minioFileName,
        fileName,
        fileSize,
        formId,
        pospId,
      )
    } else {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        FilesErrorsEnum.FILE_ID_ALREADY_EXISTS_ERROR,
        FilesErrorsResponseEnum.FILE_ID_ALREADY_EXISTS_ERROR,
      )
    }

    const scannerResponse = await this.filesHelper.notifyScannerClient(
      minioFileName,
      formInfo,
    )

    if (!scannerResponse) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        FilesErrorsEnum.SCANNER_NO_RESPONSE_ERROR,
        FilesErrorsResponseEnum.SCANNER_NO_RESPONSE_ERROR,
      )
    }

    return this.filesHelper.updateFile(file, scannerResponse)
  }

  async updateFile(
    id: string,
    updateData: Prisma.FilesUpdateInput,
  ): Promise<void> {
    await this.prisma.files.update({
      where: {
        id,
      },
      data: updateData,
    })

    // TODO check for errors

    // TODO ginisOrder to DTOs
  }

  decodeFileIdFromJwtToken(jwtToken: string): string {
    let decoded
    try {
      decoded = jwt.verify(jwtToken, this.jwtSecret)
    } catch (error) {
      throw this.throwerErrorGuard.UnauthorizedException(
        FilesErrorsEnum.INVALID_OR_EXPIRED_JWT_TOKEN_ERROR,
        FilesErrorsResponseEnum.INVALID_OR_EXPIRED_JWT_TOKEN_ERROR,
      )
    }

    // check if decoded is string
    if (typeof decoded === 'string') {
      throw this.throwerErrorGuard.BadRequestException(
        FilesErrorsEnum.INVALID_JWT_TOKEN_ERROR,
        FilesErrorsResponseEnum.INVALID_JWT_TOKEN_ERROR,
      )
    }

    if (decoded.fileId === undefined) {
      throw this.throwerErrorGuard.BadRequestException(
        FilesErrorsEnum.NO_FILE_ID_IN_JWT_TOKEN_ERROR,
        FilesErrorsResponseEnum.NO_FILE_ID_IN_JWT_TOKEN_ERROR,
      )
    }

    return <string>decoded.fileId
  }

  async downloadFile(fileId: string): Promise<Readable> {
    this.logger.debug(`Received file download request for fileId ${fileId}.`)
    const file = await this.getFile(fileId)
    this.logger.debug(
      `Minio file name: ${file.minioFileName} was found with scan status: ${file.status}.`,
    )
    const formInfo = this.filesHelper.fileDto2formInfo(file)
    const filePath = this.filesHelper.getPath(formInfo)
    const pathWithMinioFileName = filePath + file.minioFileName
    const bucket = this.filesHelper.getBucketUid(file.status)
    this.logger.debug(
      `Downloading from bucket: ${bucket}, file path with minioFileName: ${pathWithMinioFileName}`,
    )

    // download
    return this.minioClientSubervice.download(bucket, pathWithMinioFileName)
  }

  async downloadToken(
    fileId: string,
    ico: string | null,
    user?: CognitoGetUserData,
  ): Promise<DownloadTokenResponseDataDto> {
    this.logger.log(`Received token download request for fileId ${fileId}.`)
    await this.getFileWithUserVerify(fileId, ico, user)
    const payload = { fileId }
    const token = jwt.sign(payload, this.jwtSecret, { expiresIn: '30s' })
    return {
      jwt: token,
    }
  }

  public async areFormAttachmentsReady(
    formId: string,
  ): Promise<FormFilesReadyResultDto> {
    const processingFiles = await this.prisma.files.findMany({
      where: {
        formId,
        status: {
          in: processingScanStatuses,
        },
      },
    })

    // if there are file in processing state, requeue message
    if (processingFiles.length > 0) {
      this.logger.warn(
        `Form with id ${formId} has files in scanning state. Requeueing message.`,
      )
      const result = {
        filesReady: false,
        requeue: true,
        error: FormError.FILES_NOT_YET_SCANNED,
        state: FormState.QUEUED,
      }
      this.logger.warn(JSON.stringify(result))
      return result
    }

    // if there are files in virus state, requeue message
    if (await this.nasesConsumerHelper.checkInfectedFiles(formId)) {
      this.logger.warn(`Form with id ${formId} has infected files.`)
      const result = {
        filesReady: false,
        requeue: false,
        state: FormState.ERROR,
        error: FormError.INFECTED_FILES,
      }
      this.logger.warn(JSON.stringify(result))
      return result
    }

    // if there are files in error state notify developers, and set form to error state
    if (await this.nasesConsumerHelper.checkErrorFiles(formId)) {
      const result = {
        filesReady: false,
        requeue: false,
        state: FormState.ERROR,
        error: FormError.UNABLE_TO_SCAN_FILES,
      }
      alertError(
        `Form with id ${formId} has files in error state. Setting form to ERROR state with error: ${FormError.UNABLE_TO_SCAN_FILES}.`,
        this.logger,
        JSON.stringify(result),
      )
      return result
    }

    return {
      filesReady: true,
      requeue: false,
    }
  }

  async checkFilesAttachmentsInJson(
    formId: string,
    formDataJson: Prisma.JsonObject,
  ): Promise<void> {
    const fileUuidsFromForm: string[] =
      this.filesHelper.getAllFileUuidsFromJson(formDataJson)
    const fileUuidsFromDatabase: string[] =
      await this.filesHelper.getFileUuidsFromDatabase(formId)

    /* check if file ids from json are also in database */
    const difference_agaisnt_json = fileUuidsFromForm.filter(
      (x) => !fileUuidsFromDatabase.includes(x),
    )

    /* if we found some file ids that are not in database, throw error */
    if (difference_agaisnt_json.length > 0) {
      throw this.throwerErrorGuard.BadRequestException(
        FilesErrorsEnum.FILE_IDS_NOT_FOUND_IN_DB_ERROR,
        `File ids: ${difference_agaisnt_json.toString()} not found in the database for this form.`,
      )
    }

    const difference_agaisnt_db = fileUuidsFromDatabase.filter(
      (x) => !fileUuidsFromForm.includes(x),
    )

    /* if we found some file ids that are not in json, but are in database, then we delete these files from db */
    if (difference_agaisnt_db.length > 0) {
      this.logger.log(
        `File ids: ${difference_agaisnt_db.toString()} were not found in json, but were found in database. Deleting these files from database for this user.`,
      )
      await this.deleteFileMany(difference_agaisnt_db)
    }
  }

  async deleteFileMany(fileIds: string[]): Promise<void> {
    let file: Files

    // eslint-disable-next-line no-restricted-syntax
    for (const fileId of fileIds) {
      try {
        // eslint-disable-next-line no-await-in-loop
        file = await this.prisma.files.delete({
          where: {
            id: fileId,
          },
        })
      } catch (error) {
        throw this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.DATABASE_ERROR,
          `Error while deleting file in the database. Error: ${<string>error}`,
        )
      }

      const formInfo = this.filesHelper.fileDto2formInfo(file)
      const filePath = this.filesHelper.getPath(formInfo)
      const pathWithMinioFileName = filePath + file.minioFileName
      const bucket = this.filesHelper.getBucketUid(file.status)
      this.logger.debug(
        `Deleting from bucket: ${bucket}, file path with minioFileName: ${pathWithMinioFileName}`,
      )
      // eslint-disable-next-line no-await-in-loop
      const deleteStatus = await this.minioClientSubervice.deleteFile(
        bucket,
        pathWithMinioFileName,
      )
      if (deleteStatus === false) {
        throw this.throwerErrorGuard.InternalServerErrorException(
          FilesErrorsEnum.FILE_DELETE_FROM_MINIO_WAS_NOT_SUCCESSFUL_ERROR,
          FilesErrorsResponseEnum.FILE_DELETE_FROM_MINIO_WAS_NOT_SUCCESSFUL_ERROR,
        )
      }
      this.logger.debug(`File ${fileIds.toString()} was successfully deleted.`)
    }
  }
}
