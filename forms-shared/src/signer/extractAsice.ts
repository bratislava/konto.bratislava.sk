import { Parser } from 'xml2js'
import Ajv from 'ajv'
import AdmZip from 'adm-zip'
import { parseObjectHashFromFormSignatureId } from './signatureId'

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
const ajv = new Ajv()

const isValidSignature = (data: any): data is AsicSignature => {
  return ajv.validate(signatureSchema, data)
}

const isValidXmlDataContainer = (data: any): data is XmlDataContainer => {
  return ajv.validate(xmlDataContainerSchema, data)
}

const isValidManifest = (data: any): data is AsicManifest => {
  return ajv.validate(manifestSchema, data)
}

export class ValidateAsiceError extends Error {
  constructor(public type: ValidateAsiceErrorType) {
    super(type)
    this.name = 'ValidateAsiceError'
  }
}

export enum ValidateAsiceErrorType {
  InvalidBase64 = 'InvalidBase64',
  InvalidZip = 'InvalidZip',
  InvalidSignature = 'InvalidSignature',
  InvalidXmlData = 'InvalidXmlData',
  InvalidManifest = 'InvalidManifest',
  InvalidObjectHash = 'InvalidObjectHash',
}

export async function validateAndExtractFromAsice(base64Asice: string) {
  let binaryZip: Buffer
  try {
    binaryZip = Buffer.from(base64Asice, 'base64')
    // Check if the base64 was actually decoded (if not, the length would be 0 or the content would be corrupted)
    if (binaryZip.length === 0 || binaryZip.toString('base64') !== base64Asice) {
      throw new ValidateAsiceError(ValidateAsiceErrorType.InvalidBase64)
    }
  } catch {
    throw new ValidateAsiceError(ValidateAsiceErrorType.InvalidBase64)
  }

  let zip: AdmZip
  try {
    zip = new AdmZip(binaryZip)
    // Try to read entries to verify it's a valid zip
    zip.getEntries()
  } catch {
    throw new ValidateAsiceError(ValidateAsiceErrorType.InvalidZip)
  }

  const manifestXml = await parser.parseStringPromise(zip.readAsText('META-INF/manifest.xml'))
  if (!isValidManifest(manifestXml)) {
    throw new ValidateAsiceError(ValidateAsiceErrorType.InvalidManifest)
  }

  const xmlDataEntry = manifestXml['manifest:manifest']['manifest:file-entry'].find((entry) =>
    entry.$['manifest:media-type'].startsWith('application/vnd.gov.sk.xmldatacontainer+xml'),
  )

  if (!xmlDataEntry) {
    throw new ValidateAsiceError(ValidateAsiceErrorType.InvalidManifest)
  }

  const signaturesXml = await parser.parseStringPromise(zip.readAsText('META-INF/signatures.xml'))
  if (!isValidSignature(signaturesXml)) {
    throw new ValidateAsiceError(ValidateAsiceErrorType.InvalidSignature)
  }

  const signatureId = signaturesXml['asic:XAdESSignatures']['ds:Signature'][0].$.Id
  const formDataHash = parseObjectHashFromFormSignatureId(signatureId)
  if (!formDataHash) {
    throw new ValidateAsiceError(ValidateAsiceErrorType.InvalidObjectHash)
  }

  const xmlDataPath = xmlDataEntry.$['manifest:full-path']
  const xmlData = await parser.parseStringPromise(zip.readAsText(xmlDataPath))
  if (!isValidXmlDataContainer(xmlData)) {
    throw new ValidateAsiceError(ValidateAsiceErrorType.InvalidXmlData)
  }

  const xmlObject = xmlData['xdc:XMLDataContainer']['xdc:XMLData'][0]

  return {
    formDataHash,
    xmlObject,
  }
}
