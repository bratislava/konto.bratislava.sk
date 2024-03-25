import { baGetDefaultFormState } from '@form-utils/defaultFormState'
import { getFileValidatorBaRjsf } from '@form-utils/validators'
import { GenericObjectType, RJSFSchema } from '@rjsf/utils'
import type { SchemaValidateFunction } from 'ajv'

import { FormFileUploadFileInfo, FormFileUploadStatusEnum } from '../types/formFileUploadTypes'

/**
 * Returns whether file shouldn't have an error in summary. Although the other states might not be enough
 * for form to be sent, they are not erroneous (e.g. uploading).
 * @param fileInfo
 */
const validateFile = (fileInfo: FormFileUploadFileInfo) => {
  return (
    [
      FormFileUploadStatusEnum.UploadQueued,
      FormFileUploadStatusEnum.Uploading,
      FormFileUploadStatusEnum.UploadDone,
      FormFileUploadStatusEnum.Scanning,
      FormFileUploadStatusEnum.ScanDone,
    ] as FormFileUploadStatusEnum[]
  ).includes(fileInfo.status.type)
}

/**
 * Validates the summary and returns error schema and info about files.
 *
 * This uses (or abuses) a possibility to provide a custom validate function for AJV. This is only
 * one of few ways how to traverse the form data for specific values. In this case, we extract the
 * files we need to give a special attention in summary.
 */
export const validateSummary = (
  schema: RJSFSchema,
  formData: GenericObjectType,
  getFileInfoById: (id: string) => FormFileUploadFileInfo,
) => {
  const infectedFiles: FormFileUploadFileInfo[] = []
  const scanningFiles: FormFileUploadFileInfo[] = []
  const uploadingFiles: FormFileUploadFileInfo[] = []

  const fileValidateFn: SchemaValidateFunction = (schemaInner, data) => {
    if (!data) {
      return true
    }

    if (typeof data !== 'string') {
      return false
    }
    const fileInfo = getFileInfoById(data)

    if (
      fileInfo.status.type === FormFileUploadStatusEnum.UploadQueued ||
      fileInfo.status.type === FormFileUploadStatusEnum.Uploading
    ) {
      uploadingFiles.push(fileInfo)
    }
    if (fileInfo.status.type === FormFileUploadStatusEnum.ScanInfected) {
      infectedFiles.push(fileInfo)
    }
    if (
      fileInfo.status.type === FormFileUploadStatusEnum.Scanning ||
      fileInfo.status.type === FormFileUploadStatusEnum.UploadDone
    ) {
      scanningFiles.push(fileInfo)
    }

    return validateFile(fileInfo)
  }

  const validator = getFileValidatorBaRjsf(fileValidateFn)

  const defaultFormData = baGetDefaultFormState(schema, formData, undefined, validator)
  const { errorSchema } = validator.validateFormData(defaultFormData, schema)

  return { infectedFiles, scanningFiles, uploadingFiles, errorSchema }
}
