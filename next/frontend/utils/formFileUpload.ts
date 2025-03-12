import { formsClient } from '@clients/forms'
import {
  GetFileResponseDtoStatusEnum,
  GetFileResponseReducedDto,
  PostFileResponseDto,
} from '@clients/openapi-forms'
import { AxiosError, AxiosProgressEvent, AxiosResponse } from 'axios'
import {
  ClientFileInfo,
  FileStatus,
  FileStatusType,
  UploadClientErrorReasonType,
} from 'forms-shared/form-files/fileStatus'
import flatten from 'lodash/flatten'
import { extensions } from 'mime-types'
import { v4 as createUuid } from 'uuid'

import { environment } from '../../environment'
import { FormFileUploadConstraints } from '../types/formFileUploadTypes'
import { isDefined } from './general'

export const uploadFile = async ({
  formId,
  file,
  id,
  abortController,
  onProgress,
  onSuccess,
  onError,
}: {
  formId: string
  file: File
  id: string
  abortController: AbortController
  onProgress: (progressPercentage: number) => void
  onSuccess: (response: AxiosResponse<PostFileResponseDto>) => void
  onError: (
    error: AxiosError<{ rawError: string; statusCode?: number; errorName?: string }>,
  ) => void
}) => {
  try {
    const response = await formsClient.filesControllerUploadFile(formId, file, file.name, id, {
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        if (progressEvent.total == null) {
          return
        }
        onProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total))
      },
      signal: abortController.signal,
      accessToken: 'onlyAuthenticated',
    })
    onSuccess(response)
  } catch (error: any) {
    // TODO: Error type
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    onError(error)
  }
}

/**
 * Returns whether the service should continue polling the server for file status.
 *
 * It checks for server files, whether some of them are in scanning state or whether some of the client files are not
 * yet in the server response.
 */
export const shouldPollServerFiles = (
  data: GetFileResponseReducedDto[] | undefined,
  clientFiles: ClientFileInfo[],
) => {
  if (!data) {
    return true
  }

  const fileNotYetFinishedScanning = data.some((file) =>
    (
      [
        GetFileResponseDtoStatusEnum.Uploaded,
        GetFileResponseDtoStatusEnum.Accepted,
        GetFileResponseDtoStatusEnum.Scanning,
      ] as GetFileResponseDtoStatusEnum[]
    ).includes(file.status),
  )

  const uploadedFileNotInScanner = clientFiles.some(
    (clientFile) =>
      clientFile.status.type === FileStatusType.WaitingForScan &&
      !data.some((serverFile) => serverFile.id === clientFile.id),
  )

  return fileNotYetFinishedScanning || uploadedFileNotInScanner
}

function getFileExtension(filename: string | null) {
  if (!filename) {
    return null
  }

  // https://stackoverflow.com/a/680982
  // eslint-disable-next-line security/detect-unsafe-regex
  const match = filename.match(/(?:\.([^.]+))?$/i)
  return match ? match[0] : null
}

/**
 * File types are defined by MIME types in the environmental variables (which are shared with a BE). However, some of
 * the file extensions mapped from MIME are too exotic to support. This list contains all the file extensions that
 * we want to exclude from the supported file extensions.
 */
const excludedFileExtensions = new Set([
  '.jpe',
  '.dot',
  '.xlm',
  '.xla',
  '.xlc',
  '.xlt',
  '.xlw',
  '.pps',
  '.pot',
])

/**
 * File extensions mapped from MIME types except of the excluded file extensions.
 * The list must be filtered first, as some mimetypes (e.g. application/x-zip-compressed) supported
 * by BE are not present in this library, however are duplicates of other mimetypes (e.g. application/zip).
 */
const supportedFileExtensions = flatten(
  environment.formsMimetypes
    .map((format) => extensions[format])
    .filter(isDefined)
    .map((extensionsList) => extensionsList.map((ext) => `.${ext}`)),
).filter((extension) => !excludedFileExtensions.has(extension))

/**
 * Returns an overlap of globally supported file extensions and the file extensions defined in the field if provided.
 * @param fieldFileExtensions
 */
export const getSupportedFileExtensions = (fieldFileExtensions?: string[]) => {
  if (!fieldFileExtensions) {
    return supportedFileExtensions
  }

  return fieldFileExtensions.filter((format) => supportedFileExtensions.includes(format))
}

/**
 * If field doesn't provide any specific file extensions, we display none because there are too many of them. However,
 * the file upload dialog only allows to select files that are supported.
 */
export const getDisplaySupportedFileExtensions = (fieldFileExtensions?: string[]) => {
  if (!fieldFileExtensions) {
    return null
  }

  return getSupportedFileExtensions(fieldFileExtensions)
}

/**
 * Returns a max file size out of global max size and the one defined in the field if provided.
 * @param fieldMaxFileSize
 */
export const getMaxFileSize = (fieldMaxFileSize?: number) => {
  const fieldMaxFileSizeBytes = fieldMaxFileSize ? fieldMaxFileSize * 1_000_000 : Infinity

  return Math.min(fieldMaxFileSizeBytes, environment.formsMaxSize)
}

/**
 * If field doesn't provide max file size, we display none. However, if the uploaded file is too big the upload will
 * fail.
 */
export const getDisplayMaxFileSize = (fieldMaxFileSize?: number) => {
  if (!fieldMaxFileSize) {
    return null
  }

  return getMaxFileSize(fieldMaxFileSize)
}

/**
 * It is possible to parametrize the constraints for the file upload by the form widget. These parameters are client-only
 * and cannot be enforced on the server. The service is not aware about these constraints, so they are needed to be
 * passed to the service by the widget directly in the upload function.
 */
const getStatusForNewFile = (file: File, constraints: FormFileUploadConstraints): FileStatus => {
  const maxFileSize = getMaxFileSize(constraints.maxFileSize)
  if (file.size > maxFileSize) {
    return {
      type: FileStatusType.UploadClientError as const,
      reason: {
        type: UploadClientErrorReasonType.LargeFile,
        maxFileSize,
      },
      canRetry: false,
    } as const
  }

  const fileExtension = getFileExtension(file.name)
  const supported = getSupportedFileExtensions(constraints.supportedFormats)

  if (fileExtension == null || !supported.includes(fileExtension.toLowerCase())) {
    return {
      type: FileStatusType.UploadClientError as const,
      reason: {
        type: UploadClientErrorReasonType.InvalidFileType as const,
        supportedFormats: supported,
      },
      canRetry: false,
    } as const
  }

  return { type: FileStatusType.UploadQueued as const }
}

export const getFileInfoForNewFiles = (files: File[], constraints: FormFileUploadConstraints) =>
  files.map((file) => {
    return {
      id: createUuid(),
      file,
      status: getStatusForNewFile(file, constraints),
    } satisfies ClientFileInfo
  })
