export interface FormFileUploadConstraints {
  maxFileSize?: number
  supportedFormats?: string[]
}

export enum FormFileUploadStatusEnum {
  UploadQueued = 'UploadQueued',
  Uploading = 'Uploading',
  UploadError = 'UploadError',
  UploadDone = 'UploadDone',
  Scanning = 'Scanning',
  ScanError = 'ScanError',
  ScanDone = 'ScanDone',
  ScanInfected = 'ScanInfected',
  UnknownFile = 'UnknownFile',
  UnknownStatus = 'UnknownStatus',
  UploadServerError = 'UploadServerError',
}

export type FormFileUploadClientFileStatus =
  | { type: FormFileUploadStatusEnum.UploadQueued }
  | {
      type: FormFileUploadStatusEnum.Uploading
      progress: number
    }
  | {
      type: FormFileUploadStatusEnum.UploadError
      error: {
        translationKey: UploadErrors
        additionalParam: string
      }
      canRetry: boolean
    }
  | { type: FormFileUploadStatusEnum.UploadDone }
  | { type: FormFileUploadStatusEnum.UnknownFile }
  | { type: FormFileUploadStatusEnum.UnknownStatus; offline: boolean }

export type FormFileUploadResponseFileStatus = {
  type: FormFileUploadStatusEnum.UploadServerError
  error: {
    rawError: string
  }
  canRetry: boolean
}

export type FormFileUploadClientFileInfo = {
  id: string
  file: File
  status: FormFileUploadClientFileStatus | FormFileUploadResponseFileStatus
}

export type FormFileUploadServerFileStatus =
  | { type: FormFileUploadStatusEnum.Scanning }
  | { type: FormFileUploadStatusEnum.ScanError }
  | { type: FormFileUploadStatusEnum.ScanDone }
  | { type: FormFileUploadStatusEnum.ScanInfected }

export type FormFileUploadFileStatus =
  | FormFileUploadClientFileStatus
  | FormFileUploadServerFileStatus
  | FormFileUploadResponseFileStatus

export type FormFileUploadFileInfo = {
  status: FormFileUploadFileStatus
  fileName: string
  canDownload: boolean
  fileSize: number | null
}

// values must match translation keys in account.json -> Upload.errors

export enum UploadErrors {
  LargeFile = 'largeFile',
  InvalidFileType = 'invalidFileType',
}
