import { strFromU8, unzipSync, type Unzipped } from 'fflate'

export const ASICE_MIMETYPE = 'application/vnd.etsi.asic-e+zip'

/**
 * Signed containers produced by D.Signer are 8–35 KB. The limits only guard against zip bombs, they are far above
 * anything a real signature needs. Sizes are the ones declared in the zip headers.
 */
const MAX_ENTRIES = 20
const MAX_TOTAL_UNCOMPRESSED_BYTES = 20 * 1024 * 1024

const MANIFEST_ENTRY = 'META-INF/manifest.xml'
/**
 * D.Signer names the signature file `signatures.xml`, some installations `signatures001.xml` (both seen in production
 * data, 2024–2026).
 */
const SIGNATURE_ENTRY_REGEX = /^META-INF\/signatures\d*\.xml$/

export enum InspectAsiceContainerErrorType {
  NotZip = 'NotZip',
  TooLarge = 'TooLarge',
  WrongMimetype = 'WrongMimetype',
  UnexpectedMetaInfEntry = 'UnexpectedMetaInfEntry',
  MissingSignature = 'MissingSignature',
  MultipleSignatures = 'MultipleSignatures',
  UnexpectedDataFiles = 'UnexpectedDataFiles',
}

export class InspectAsiceContainerError extends Error {
  constructor(public type: InspectAsiceContainerErrorType) {
    super(type)
    this.name = 'InspectAsiceContainerError'
  }
}

export type InspectedAsiceContainer = {
  /** Name of the single signed data file, e.g. `signed_form_Priznanie_k_dani_z_nehnutelnosti.xdcf`. */
  dataFileName: string
  /** Content of the signed data file (XMLDataContainer) decoded as UTF-8. */
  dataXml: string
  signatureFileName: string
}

const unzip = (base64: string): Unzipped => {
  let entries = 0
  let totalSize = 0
  let tooLarge = false

  let files: Unzipped
  try {
    files = unzipSync(Buffer.from(base64, 'base64'), {
      filter: (file) => {
        entries += 1
        totalSize += file.originalSize
        if (entries > MAX_ENTRIES || totalSize > MAX_TOTAL_UNCOMPRESSED_BYTES) {
          tooLarge = true
        }
        return !tooLarge
      },
    })
  } catch {
    throw new InspectAsiceContainerError(InspectAsiceContainerErrorType.NotZip)
  }

  if (tooLarge) {
    throw new InspectAsiceContainerError(InspectAsiceContainerErrorType.TooLarge)
  }

  return files
}

/**
 * Checks the structure of a signed ASiC-E container (as returned by D.Signer `getSignatureWithASiCEnvelopeBase64`)
 * without verifying the signature itself.
 *
 * Signature verification services (CEP) only report what is covered by a signature. A container with an additional
 * unsigned file still verifies as valid, and the extra file is not mentioned in the result. This check therefore
 * requires the exact layout D.Signer produces: `mimetype`, optional `META-INF/manifest.xml`, exactly one
 * `META-INF/signatures*.xml` and exactly one data file.
 */
export const inspectAsiceContainer = (base64: string): InspectedAsiceContainer => {
  const files = unzip(base64)
  const names = Object.keys(files).filter((name) => !name.endsWith('/'))

  const mimetype = files.mimetype
  if (!mimetype || strFromU8(mimetype) !== ASICE_MIMETYPE) {
    throw new InspectAsiceContainerError(InspectAsiceContainerErrorType.WrongMimetype)
  }

  const metaInf = names.filter((name) => name.startsWith('META-INF/'))
  if (metaInf.some((name) => name !== MANIFEST_ENTRY && !SIGNATURE_ENTRY_REGEX.test(name))) {
    throw new InspectAsiceContainerError(InspectAsiceContainerErrorType.UnexpectedMetaInfEntry)
  }

  const signatureFiles = metaInf.filter((name) => SIGNATURE_ENTRY_REGEX.test(name))
  if (signatureFiles.length === 0) {
    throw new InspectAsiceContainerError(InspectAsiceContainerErrorType.MissingSignature)
  }
  if (signatureFiles.length > 1) {
    throw new InspectAsiceContainerError(InspectAsiceContainerErrorType.MultipleSignatures)
  }

  const dataFiles = names.filter((name) => name !== 'mimetype' && !name.startsWith('META-INF/'))
  if (dataFiles.length !== 1) {
    throw new InspectAsiceContainerError(InspectAsiceContainerErrorType.UnexpectedDataFiles)
  }

  const [dataFileName] = dataFiles
  return {
    dataFileName,
    dataXml: strFromU8(files[dataFileName]),
    signatureFileName: signatureFiles[0],
  }
}
