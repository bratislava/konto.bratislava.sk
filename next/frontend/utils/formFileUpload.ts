import { formsApi } from '@clients/forms'
import {
  GetFileResponseDto,
  GetFileResponseDtoStatusEnum,
  PostFileResponseDto,
} from '@clients/openapi-forms'
import { AxiosProgressEvent, AxiosResponse } from 'axios'
import flatten from 'lodash/flatten'
import { extensions } from 'mime-types'
import prettyBytes from 'pretty-bytes'
import { v4 as createUuid } from 'uuid'

import { environment } from '../../environment'
import {
  FormFileUploadClientFileInfo,
  FormFileUploadConstraints,
  FormFileUploadFileInfo,
  FormFileUploadFileStatus,
  FormFileUploadStatusEnum,
  UploadErrors,
} from '../types/formFileUploadTypes'

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
  onError: (error: Error) => void
}) => {
  try {
    const response = await formsApi.filesControllerUploadFile(formId, file, file.name, id, {
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
  data: GetFileResponseDto[] | undefined,
  clientFiles: FormFileUploadClientFileInfo[],
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
      clientFile.status.type === FormFileUploadStatusEnum.UploadDone &&
      !data.some((serverFile) => serverFile.id === clientFile.id),
  )

  return fileNotYetFinishedScanning || uploadedFileNotInScanner
}

const serverResponseToStatusMap: Record<GetFileResponseDtoStatusEnum, FormFileUploadFileStatus> = {
  [GetFileResponseDtoStatusEnum.Uploaded]: { type: FormFileUploadStatusEnum.Scanning as const },
  [GetFileResponseDtoStatusEnum.Accepted]: { type: FormFileUploadStatusEnum.Scanning as const },
  [GetFileResponseDtoStatusEnum.Queued]: { type: FormFileUploadStatusEnum.Scanning as const },
  [GetFileResponseDtoStatusEnum.Scanning]: { type: FormFileUploadStatusEnum.Scanning as const },
  [GetFileResponseDtoStatusEnum.Safe]: { type: FormFileUploadStatusEnum.ScanDone as const },
  [GetFileResponseDtoStatusEnum.Infected]: {
    type: FormFileUploadStatusEnum.ScanInfected as const,
  },
  [GetFileResponseDtoStatusEnum.NotFound]: {
    type: FormFileUploadStatusEnum.ScanError as const,
  },
  [GetFileResponseDtoStatusEnum.MoveErrorSafe]: {
    type: FormFileUploadStatusEnum.ScanError as const,
  },
  [GetFileResponseDtoStatusEnum.MoveErrorInfected]: {
    type: FormFileUploadStatusEnum.ScanInfected as const,
  },
  [GetFileResponseDtoStatusEnum.ScanError]: {
    type: FormFileUploadStatusEnum.ScanError as const,
  },
  [GetFileResponseDtoStatusEnum.ScanTimeout]: {
    type: FormFileUploadStatusEnum.ScanError as const,
  },
  [GetFileResponseDtoStatusEnum.ScanNotSuccessful]: {
    type: FormFileUploadStatusEnum.ScanError as const,
  },
  [GetFileResponseDtoStatusEnum.FormIdNotFound]: {
    type: FormFileUploadStatusEnum.UnknownFile as const,
  },
}

/**
 * Merges client and server files into a single object.
 *
 * The uploaded files are stored both in the `clientFiles` and `serverFiles`. However, the clientFiles don't hold the
 * necessary information so is overridden by the `serverFiles`.
 */
export const mergeClientAndServerFiles = (
  clientFiles: FormFileUploadClientFileInfo[],
  serverFiles: GetFileResponseDto[],
) => {
  const clientMapped = clientFiles.map(
    (file) =>
      [
        file.id,
        {
          status: file.status,
          fileName: file.file.name,
          canDownload: false,
          fileSize: file.file.size,
        } satisfies FormFileUploadFileInfo,
      ] as const,
  )
  const serverMapped = serverFiles.map((file) => {
    const status = serverResponseToStatusMap[file.status]
    return [
      file.id,
      {
        status: serverResponseToStatusMap[file.status],
        fileName: file.fileName,
        canDownload: [
          FormFileUploadStatusEnum.Scanning,
          FormFileUploadStatusEnum.ScanDone,
        ].includes(status.type),
        fileSize: file.fileSize,
      } satisfies FormFileUploadFileInfo,
    ] as const
  })

  return Object.fromEntries<FormFileUploadFileInfo>([
    ...clientMapped,
    // If there's a conflict, the server file takes precedence which is an expected behaviour.
    ...serverMapped,
  ])
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
 */
const supportedFileExtensions = flatten(
  environment.formsMimetypes.map((format) => extensions[format].map((ext) => `.${ext}`)),
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
const getStatusForNewFile = (file: File, constraints: FormFileUploadConstraints) => {
  const maxFileSize = getMaxFileSize(constraints.maxFileSize)
  if (file.size > maxFileSize) {
    return {
      type: FormFileUploadStatusEnum.UploadError as const,
      // TODO: Improve error message.
      error: { translationKey: UploadErrors.LargeFile, additionalParam: prettyBytes(maxFileSize) },
      canRetry: false,
    }
  }

  const fileExtension = getFileExtension(file.name)
  const supported = getSupportedFileExtensions(constraints.supportedFormats)

  if (fileExtension == null || !supported.includes(fileExtension.toLowerCase())) {
    return {
      type: FormFileUploadStatusEnum.UploadError as const,
      // TODO: Improve error message.
      error: {
        translationKey: UploadErrors.InvalidFileType,
        additionalParam: supported.join(', '),
      },
      canRetry: false,
    }
  }

  return { type: FormFileUploadStatusEnum.UploadQueued as const }
}

export const getFileInfoForNewFiles = (files: File[], constraints: FormFileUploadConstraints) =>
  files.map((file) => {
    return {
      id: createUuid(),
      file,
      status: getStatusForNewFile(file, constraints),
    } satisfies FormFileUploadClientFileInfo
  })
