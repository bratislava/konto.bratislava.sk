import { Parser } from 'xml2js'
import Ajv from 'ajv'
import AdmZip from 'adm-zip'
import { parseFormDataHashFromFormSignatureId } from './signatureId'

type AsicSignature = {
  'asic:XAdESSignatures': {
    'ds:Signature': [
      {
        $: {
          Id: string
        }
      },
    ]
  }
}

type XmlDataContainer = {
  'xdc:XMLDataContainer': {
    'xdc:XMLData': [
      {
        [key: string]: any
      },
    ]
  }
}

type AsicManifest = {
  'manifest:manifest': {
    'manifest:file-entry': Array<{
      $: {
        'manifest:full-path': string
        'manifest:media-type': string
      }
    }>
  }
}

const signatureSchema = {
  type: 'object',
  properties: {
    'asic:XAdESSignatures': {
      type: 'object',
      properties: {
        'ds:Signature': {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              $: {
                type: 'object',
                properties: {
                  Id: { type: 'string' },
                },
                required: ['Id'],
              },
            },
            required: ['$'],
          },
          minItems: 1,
        },
      },
      required: ['ds:Signature'],
    },
  },
  required: ['asic:XAdESSignatures'],
}

const xmlDataContainerSchema = {
  type: 'object',
  properties: {
    'xdc:XMLDataContainer': {
      type: 'object',
      properties: {
        'xdc:XMLData': {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: true,
          },
          minItems: 1,
          maxItems: 1,
        },
      },
      required: ['xdc:XMLData'],
    },
  },
  required: ['xdc:XMLDataContainer'],
}

const manifestSchema = {
  type: 'object',
  properties: {
    'manifest:manifest': {
      type: 'object',
      properties: {
        'manifest:file-entry': {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              $: {
                type: 'object',
                properties: {
                  'manifest:full-path': { type: 'string' },
                  'manifest:media-type': { type: 'string' },
                },
                required: ['manifest:full-path', 'manifest:media-type'],
              },
            },
            required: ['$'],
          },
          minItems: 1,
        },
      },
      required: ['manifest:file-entry'],
    },
  },
  required: ['manifest:manifest'],
}

const parser = new Parser({ explicitArray: true })

const isValidSignature = (data: any): data is AsicSignature => {
  const ajv = new Ajv()
  return ajv.validate(signatureSchema, data)
}

const isValidXmlDataContainer = (data: any): data is XmlDataContainer => {
  const ajv = new Ajv()
  return ajv.validate(xmlDataContainerSchema, data)
}

const isValidManifest = (data: any): data is AsicManifest => {
  const ajv = new Ajv()
  return ajv.validate(manifestSchema, data)
}

export class ValidateExtractAsiceError extends Error {
  constructor(public type: ValidateExtractAsiceErrorType) {
    super(type)
    this.name = 'ValidateExtractAsiceError'
  }
}

export enum ValidateExtractAsiceErrorType {
  InvalidBase64 = 'InvalidBase64',
  InvalidZip = 'InvalidZip',
  InvalidSignature = 'InvalidSignature',
  InvalidXmlData = 'InvalidXmlData',
  InvalidManifest = 'InvalidManifest',
  InvalidFormDataHash = 'InvalidFormDataHash',
}

/**
 * Validates and extracts the XML data and object hash from the ASiCe container.
 *
 * Uses minimal schemas to validate the structure of the ASiCe container and get the appropriate data.
 */
export async function validateExtractAsice(base64Asice: string) {
  let binaryZip: Buffer
  try {
    binaryZip = Buffer.from(base64Asice, 'base64')
    // Check if the base64 was actually decoded (if not, the length would be 0 or the content would be corrupted)
    if (binaryZip.length === 0 || binaryZip.toString('base64') !== base64Asice) {
      throw new ValidateExtractAsiceError(ValidateExtractAsiceErrorType.InvalidBase64)
    }
  } catch {
    throw new ValidateExtractAsiceError(ValidateExtractAsiceErrorType.InvalidBase64)
  }

  let zip: AdmZip
  try {
    zip = new AdmZip(binaryZip)
    // Try to read entries to verify it's a valid zip
    zip.getEntries()
  } catch {
    throw new ValidateExtractAsiceError(ValidateExtractAsiceErrorType.InvalidZip)
  }

  const manifestXml = await parser.parseStringPromise(zip.readAsText('META-INF/manifest.xml'))
  if (!isValidManifest(manifestXml)) {
    throw new ValidateExtractAsiceError(ValidateExtractAsiceErrorType.InvalidManifest)
  }

  const xmlDataEntry = manifestXml['manifest:manifest']['manifest:file-entry'].find((entry) =>
    entry.$['manifest:media-type'].startsWith('application/vnd.gov.sk.xmldatacontainer+xml'),
  )

  if (!xmlDataEntry) {
    throw new ValidateExtractAsiceError(ValidateExtractAsiceErrorType.InvalidManifest)
  }

  const signaturesXml = await parser.parseStringPromise(zip.readAsText('META-INF/signatures.xml'))
  if (!isValidSignature(signaturesXml)) {
    throw new ValidateExtractAsiceError(ValidateExtractAsiceErrorType.InvalidSignature)
  }

  const signatureId = signaturesXml['asic:XAdESSignatures']['ds:Signature'][0].$.Id
  const formDataHash = parseFormDataHashFromFormSignatureId(signatureId)
  if (!formDataHash) {
    throw new ValidateExtractAsiceError(ValidateExtractAsiceErrorType.InvalidFormDataHash)
  }

  const xmlDataPath = xmlDataEntry.$['manifest:full-path']
  const xmlData = await parser.parseStringPromise(zip.readAsText(xmlDataPath))
  if (!isValidXmlDataContainer(xmlData)) {
    throw new ValidateExtractAsiceError(ValidateExtractAsiceErrorType.InvalidXmlData)
  }

  const xmlObject = xmlData['xdc:XMLDataContainer']['xdc:XMLData'][0]

  return {
    formDataHash,
    xmlObject,
  }
}
