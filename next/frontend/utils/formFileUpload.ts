import { formsApi } from '@clients/forms'
import {
  GetFileResponseDto,
  GetFileResponseDtoStatusEnum,
  PostFileResponseDto,
} from '@clients/openapi-forms'
import to from 'await-to-js'
import { AxiosProgressEvent, AxiosResponse } from 'axios'
import { v4 as createUuid } from 'uuid'

import {
  FormFileUploadClientFileInfo,
  FormFileUploadConstraints,
  FormFileUploadFileInfo,
  FormFileUploadStatusEnum,
} from '../types/formFileUploadTypes'
import { getAccessTokenOrLogout } from './amplify'

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
  // TODO handle access token failure
  const accessToken = await getAccessTokenOrLogout()

  const [err, response] = await to(
    formsApi.filesControllerUploadFile(formId, file, file.name, id, {
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        if (progressEvent.total == null) {
          return
        }
        onProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total))
      },
      signal: abortController.signal,
      accessToken,
    }),
  )

  if (err) {
    onError(err)
    return
  }

  onSuccess(response)
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

const serverResponseToStatusMap = {
  [GetFileResponseDtoStatusEnum.Uploaded]: { type: FormFileUploadStatusEnum.Scanning as const },
  [GetFileResponseDtoStatusEnum.Accepted]: { type: FormFileUploadStatusEnum.Scanning as const },
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
        { status: file.status, fileName: file.file.name } satisfies FormFileUploadFileInfo,
      ] as const,
  )
  const serverMapped = serverFiles.map(
    (file) =>
      [
        file.id,
        {
          status: serverResponseToStatusMap[file.status],
          fileName: file.fileName,
        } satisfies FormFileUploadFileInfo,
      ] as const,
  )

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

  const match = filename.match(/\.[\da-z]+$/i)
  return match ? match[0] : null
}

/**
 * It is possible to parametrize the constraints for the file upload by the form widget. These parameters are client-only
 * and cannot be enforced on the server. The service is not aware about these constraints, so they are needed to be
 * passed to the service by the widget directly in the upload function.
 */
const getStatusForNewFile = (file: File, constraints: FormFileUploadConstraints) => {
  if (constraints.maxFileSize != null && file.size > constraints.maxFileSize * 1_000_000) {
    return {
      type: FormFileUploadStatusEnum.UploadError as const,
      // TODO: Improve error message.
      error: 'File too big',
      canRetry: false,
    }
  }

  // TODO: Add support for generally supported file extensions.
  const fileExtension = getFileExtension(file.name)
  if (
    constraints.supportedFormats != null &&
    (fileExtension == null || !constraints.supportedFormats.includes(fileExtension))
  ) {
    return {
      type: FormFileUploadStatusEnum.UploadError as const,
      // TODO: Improve error message.
      error: 'Invalid file type',
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
