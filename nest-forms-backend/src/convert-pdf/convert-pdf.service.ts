import { Injectable } from '@nestjs/common'
import { FormDefinitionSlovenskoSk } from 'forms-shared/definitions/formDefinitionTypes'

import ConvertService from '../convert/convert.service'
import { FormInfo } from '../files/files.dto'
import FilesHelper from '../files/files.helper'
import {
  FormsErrorsEnum,
  FormsErrorsResponseEnum,
} from '../forms/forms.errors.enum'
import FormsService from '../forms/forms.service'
import { PDF_EXPORT_FILE_NAME } from '../utils/files'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import MinioClientSubservice from '../utils/subservices/minio-client.subservice'

/**
 * Creates a pdf file from filled-in form and uploads it to minio among SAFE form files.
 * Used for creating a pdf-version to be uploaded to GINIS when sending the form
 * This circumvents the issue of forms not displaying correctly inside GINIS
 */
@Injectable()
export default class ConvertPdfService {
  constructor(
    private readonly formsService: FormsService,
    private readonly minioClientSubservice: MinioClientSubservice,
    private readonly convertService: ConvertService,
    private readonly filesHelper: FilesHelper,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
  ) {}

  /**
   * @param formId id of our form object
   * @returns expected path within the bucket, without the bucket itself
   */
  async getPdfExportFilePathWithoutBucket(
    formId: string,
    formDefinition: FormDefinitionSlovenskoSk,
  ): Promise<string> {
    const form = await this.formsService.getUniqueForm(formId)
    if (!form) {
      throw this.throwerErrorGuard.NotFoundException(
        FormsErrorsEnum.FORM_NOT_FOUND_ERROR,
        `${FormsErrorsResponseEnum.FORM_NOT_FOUND_ERROR} id: ${formId}.`,
      )
    }

    const formInfo: FormInfo = {
      pospIdOrSlug: formDefinition.pospID,
      formId,
    }
    const formPath = this.filesHelper.getPath(formInfo)
    return `${formPath}${PDF_EXPORT_FILE_NAME}`
  }

  /**
   * Creates a pdf file from filled-in form and uploads it to minio among SAFE form files.
   * Also saves the file record to the database among the rest fo the form files.
   * @param formId id of the form
   */
  async createPdfImageInFormFiles(
    formId: string,
    formDefinition: FormDefinitionSlovenskoSk,
  ): Promise<string> {
    const form = await this.formsService.getUniqueForm(formId)
    if (!form) {
      throw this.throwerErrorGuard.NotFoundException(
        FormsErrorsEnum.FORM_NOT_FOUND_ERROR,
        `${FormsErrorsResponseEnum.FORM_NOT_FOUND_ERROR} id: ${formId}.`,
      )
    }

    if (form.formDataJson == null) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        FormsErrorsEnum.EMPTY_FORM_DATA,
        FormsErrorsResponseEnum.EMPTY_FORM_DATA,
      )
    }

    // putObject requires bucket name on it's own
    const filePath = await this.getPdfExportFilePathWithoutBucket(
      formId,
      formDefinition,
    )

    const file = await this.convertService.generatePdf(
      form.formDataJson,
      formId,
      formDefinition,
    )

    await this.minioClientSubservice
      .client()
      .putObject(this.filesHelper.getBucketUid('SAFE'), filePath, file)

    // save file to database, from this point onwards it behaves like other files attached to form
    const pospId = formDefinition.pospID
    const minioFileName = PDF_EXPORT_FILE_NAME
    const fileName = PDF_EXPORT_FILE_NAME
    // TODO I'm not sure how to easily get the size, and it's not used as we don't display these files to the user
    // fix once we start displaying the uploaded files next to the form
    const fileSize = 1
    // in case PDF_EXPORT_FILE_NAME file already exists, using our 'upsert' ensures it updates the record to match the newest data
    await this.filesHelper.upsertFileByUid(
      minioFileName,
      fileName,
      fileSize,
      'SAFE',
      formId,
      pospId,
    )

    // formats accepted by GINIS automation service: s3://bucket/path, /bucket/path, bucket/path
    return `${this.filesHelper.getBucketUid('SAFE')}${filePath}`
  }
}
