import { GenericObjectType } from '@rjsf/utils'
import { FileIdInfoMap, FileInfoJson } from '../summary-email/renderSummaryEmail'

function replaceFileUuidWithFileData(uuid: string, fileIdInfoMap: FileIdInfoMap): FileInfoJson {
  return fileIdInfoMap[uuid] || uuid
}

export function addFilesToJsonData(
  formData: GenericObjectType,
  fileIdInfoMap: FileIdInfoMap,
): GenericObjectType {
  const result = JSON.parse(JSON.stringify(formData))

  Object.entries(result.prilohy).forEach(([key, fileUuids]) => {
    if (Array.isArray(fileUuids)) {
      result.prilohy[key] = fileUuids.map((fileUuid: string) =>
        replaceFileUuidWithFileData(fileUuid, fileIdInfoMap),
      )
    } else if (typeof fileUuids === 'string') {
      result.prilohy[key] = replaceFileUuidWithFileData(fileUuids, fileIdInfoMap)
    }
  })

  return result
}
