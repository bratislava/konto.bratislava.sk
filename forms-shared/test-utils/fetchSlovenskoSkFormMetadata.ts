import { FormDefinitionSlovenskoSk } from '../src/definitions/formDefinitionTypes'
import fs from 'fs/promises'

export interface SlovenskoSkMetadataJson {
  XSDtargetNamespace: string
  title: string
  identifier: string
  shortIdentifier: string
  eformURI: string
  eformPartsURI: string
  description: string
  creator: string
  publisherURI: string
  publisherUpvsURI: string
  language: string | null
  version: string
  validDateFrom: string
  validDateTo: string | null
  inForceFrom: string
  inForceTo: string | null
  changeDate: string
}

export async function fetchSlovenskoSkMetadata() {
  const metadataPath = process.env.SLOVENSKO_SK_METADATA_PATH

  // The file download is too slow (the file is large) and makes the test run long, the metadata file is prefetched
  // in Dockerfile on CI.
  if (metadataPath) {
    const fileContent = await fs.readFile(metadataPath, 'utf-8')
    return JSON.parse(fileContent) as SlovenskoSkMetadataJson[]
  }

  const url = 'https://www.slovensko.sk/static/eForm/datasetexport/json/mef.json'
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch metadata: ${response.statusText}`)
  }

  return (await response.json()) as SlovenskoSkMetadataJson[]
}

export function findSlovenskoSkFormMetadata(
  allMetadata: SlovenskoSkMetadataJson[],
  formDefinition: FormDefinitionSlovenskoSk,
) {
  const formMetadata = allMetadata.find(
    (item) =>
      item.shortIdentifier === formDefinition.pospID && item.version === formDefinition.pospVersion,
  )

  if (!formMetadata) {
    throw new Error(
      `Form metadata not found for ID ${formDefinition.pospID} version ${formDefinition.pospVersion}`,
    )
  }

  return formMetadata
}
