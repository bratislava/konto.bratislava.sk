export enum FileStatusType {
  UploadQueued = 'UploadQueued',
  Uploading = 'Uploading',
  UploadClientError = 'UploadClientError',
  WaitingForScan = 'WaitingForScan',
  Scanning = 'Scanning',
  ScanError = 'ScanError',
  ScanDone = 'ScanDone',
  ScanInfected = 'ScanInfected',
  UnknownFile = 'UnknownFile',
  UnknownStatus = 'UnknownStatus',
  UploadServerError = 'UploadServerError',
}

export const isDoneFileStatusType = (status: FileStatusType) => status === FileStatusType.ScanDone
export const isUploadFileStatusType = (status: FileStatusType) =>
  status === FileStatusType.Uploading || status === FileStatusType.UploadQueued
export const isScanFileStatusType = (status: FileStatusType) =>
  status === FileStatusType.WaitingForScan || status === FileStatusType.Scanning
export const isErrorFileStatusType = (status: FileStatusType) =>
  !isDoneFileStatusType(status) && !isUploadFileStatusType(status) && !isScanFileStatusType(status)
export const isInfectedFileStatusType = (status: FileStatusType) =>
  status === FileStatusType.ScanInfected
export const isDownloadableFileStatusType = (status: FileStatusType) =>
  isDoneFileStatusType(status) || isScanFileStatusType(status)

export enum UploadClientErrorReasonType {
  LargeFile = 'LargeFile',
  InvalidFileType = 'InvalidFileType',
}

export type FileStatus =
  | { type: FileStatusType.UploadQueued }
  | {
      type: FileStatusType.Uploading
      progress: number
      abortController: AbortController
    }
  | {
      type: FileStatusType.UploadClientError
      reason:
        | {
            type: UploadClientErrorReasonType.LargeFile
            maxFileSize: number
          }
        | {
            type: UploadClientErrorReasonType.InvalidFileType
            supportedFormats: string[]
          }
      canRetry: boolean
    }
  | { type: FileStatusType.WaitingForScan }
  | { type: FileStatusType.UnknownFile }
  | {
      type: FileStatusType.UploadServerError
      error: Error
      canRetry: boolean
    }
  | { type: FileStatusType.UnknownStatus; offline: boolean }
  | { type: FileStatusType.Scanning }
  | { type: FileStatusType.ScanError }
  | { type: FileStatusType.ScanDone }
  | { type: FileStatusType.ScanInfected }

export type ClientFileInfo = {
  status: FileStatus
  id: string
  file: File
}

export type FileInfo = {
  status: FileStatus
  fileName: string
  fileSize: number | null
}

export type FileInfoSummary = {
  id: string
  statusType: FileStatusType
  fileName: string
}
