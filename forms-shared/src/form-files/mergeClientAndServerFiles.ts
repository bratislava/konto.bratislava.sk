import { ClientFileInfo, FileInfo, FileInfoSummary, FileStatus, FileStatusType } from './fileStatus'
import { FormsBackendFile, FormsBackendFileStatusEnum } from './serverFilesTypes'

const mapClientFile = (clientFileInfo: ClientFileInfo): Record<string, FileInfo> => ({
  [clientFileInfo.id]: {
    status: clientFileInfo.status,
    fileName: clientFileInfo.file.name,
    fileSize: clientFileInfo.file.size,
  },
})

const mapClientFileSummary = (clientFileInfo: ClientFileInfo): Record<string, FileInfoSummary> => ({
  [clientFileInfo.id]: {
    id: clientFileInfo.id,
    statusType: clientFileInfo.status.type,
    fileName: clientFileInfo.file.name,
  },
})

const serverResponseToStatusMap: Record<FormsBackendFileStatusEnum, FileStatusType> = {
  [FormsBackendFileStatusEnum.Uploaded]: FileStatusType.WaitingForScan,
  [FormsBackendFileStatusEnum.Accepted]: FileStatusType.WaitingForScan,
  [FormsBackendFileStatusEnum.Queued]: FileStatusType.WaitingForScan,
  [FormsBackendFileStatusEnum.Scanning]: FileStatusType.Scanning,
  [FormsBackendFileStatusEnum.Safe]: FileStatusType.ScanDone,
  [FormsBackendFileStatusEnum.Infected]: FileStatusType.ScanInfected,
  [FormsBackendFileStatusEnum.NotFound]: FileStatusType.ScanError,
  [FormsBackendFileStatusEnum.MoveErrorSafe]: FileStatusType.ScanError,
  [FormsBackendFileStatusEnum.MoveErrorInfected]: FileStatusType.ScanInfected,
  [FormsBackendFileStatusEnum.ScanError]: FileStatusType.ScanError,
  [FormsBackendFileStatusEnum.ScanTimeout]: FileStatusType.ScanError,
  [FormsBackendFileStatusEnum.ScanNotSuccessful]: FileStatusType.ScanError,
  [FormsBackendFileStatusEnum.FormIdNotFound]: FileStatusType.UnknownFile,
}

const mapServerFile = (serverFileInfo: FormsBackendFile): Record<string, FileInfo> => ({
  [serverFileInfo.id]: {
    status: { type: serverResponseToStatusMap[serverFileInfo.status] } as FileStatus,
    fileName: serverFileInfo.fileName,
    fileSize: serverFileInfo.fileSize,
  },
})

const mapServerFileSummary = (
  serverFileInfo: FormsBackendFile,
): Record<string, FileInfoSummary> => ({
  [serverFileInfo.id]: {
    id: serverFileInfo.id,
    statusType: serverResponseToStatusMap[serverFileInfo.status],
    fileName: serverFileInfo.fileName,
  },
})

/**
 * Merges client and server files into a single object.
 *
 * The uploaded files are stored both in the `clientFiles` and `serverFiles`. However, the clientFiles don't hold the
 * necessary information so is overridden by the `serverFiles`.
 */
export const mergeClientAndServerFiles = (
  clientFiles: ClientFileInfo[],
  serverFiles: FormsBackendFile[],
) => {
  const clientFilesMapped = clientFiles.map(mapClientFile)
  const serverFilesMapped = serverFiles.map(mapServerFile)

  // If there's a conflict, the server file takes precedence which is an expected behaviour.
  return [...clientFilesMapped, ...serverFilesMapped].reduce(
    (acc, curr) => ({ ...acc, ...curr }),
    {},
  )
}

export const mergeClientAndServerFilesSummary = (
  clientFiles: ClientFileInfo[] = [],
  serverFiles: FormsBackendFile[] = [],
) => {
  const clientFilesMapped = clientFiles.map(mapClientFileSummary)
  const serverFilesMapped = serverFiles.map(mapServerFileSummary)

  // If there's a conflict, the server file takes precedence which is an expected behaviour.
  return [...clientFilesMapped, ...serverFilesMapped].reduce(
    (acc, curr) => ({ ...acc, ...curr }),
    {},
  )
}
