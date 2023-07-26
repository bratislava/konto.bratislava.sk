export interface FormFileUploadContextType {
  uploadFiles: (files: File[], constraints: FormFileUploadConstraints) => string[]
  removeFiles: (ids: string[]) => void
  keepFiles: (ids: string[]) => void
  retryFile: (id: string, constraints: FormFileUploadConstraints) => string | null
  downloadFile: (id: string) => void
  getFileInfoById: (id: string) => FormFileUploadFileInfo
}

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
}

export type FormFileUploadClientFileStatus =
  | { type: FormFileUploadStatusEnum.UploadQueued }
  | {
      type: FormFileUploadStatusEnum.Uploading
      progress: number
    }
  | { type: FormFileUploadStatusEnum.UploadError; error: string; canRetry: boolean }
  | { type: FormFileUploadStatusEnum.UploadDone }
  | { type: FormFileUploadStatusEnum.UnknownFile }

export type FormFileUploadClientFileInfo = {
  id: string
  file: File
  status: FormFileUploadClientFileStatus
}
export type FormFileUploadServerFileStatus =
  | { type: FormFileUploadStatusEnum.Scanning }
  | { type: FormFileUploadStatusEnum.ScanError }
  | { type: FormFileUploadStatusEnum.ScanDone }
  | { type: FormFileUploadStatusEnum.ScanInfected }

export type FormFileUploadFileStatus =
  | FormFileUploadClientFileStatus
  | FormFileUploadServerFileStatus

export type FormFileUploadFileInfo = {
  status: FormFileUploadFileStatus
  fileName: string
  canDownload: boolean
  fileSize: number | null
}
