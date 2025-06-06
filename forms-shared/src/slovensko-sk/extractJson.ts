import { FormDefinitionSlovenskoSk } from '../definitions/formDefinitionTypes'
import { Parser } from 'xml2js'
import Ajv from 'ajv'
import { parseSlovenskoSkXmlnsString } from './urls'
import { GenericObjectType } from '@rjsf/utils'
import { isValidVersion } from '../versioning/version-compare'

const baseFormXmlSchema = {
  type: 'object',
  properties: {
    eform: {
      type: 'object',
      properties: {
        $: {
          type: 'object',
          properties: {
            xmlns: {
              type: 'string',
            },
          },
          required: ['xmlns'],
        },
        FormId: {
          type: 'array',
          items: {
            type: 'string',
          },
          minItems: 1,
          maxItems: 1,
        },
        JsonVersion: {
          type: 'array',
          items: {
            type: 'string',
          },
          minItems: 1,
          maxItems: 1,
        },
        Json: {
          type: 'array',
          items: {
            type: 'string',
          },
          minItems: 1,
          maxItems: 1,
        },
      },
      required: ['$', 'Json'],
    },
  },
  required: ['eform'],
}

type BaseFormXml = {
  eform: {
    $: {
      xmlns: string
    }
    /* Added on 2025-04-29. */
    FormId?: [string]
    /* Added on 2024-11-12 with hardcoded value `1.0`, real values (semver format e.g. `1.0.0`) added on 2025-02-24. */
    JsonVersion?: [string]
    Json: [string]
  }
}

const parser = new Parser({ explicitArray: true })

const isBaseFormXml = (data: any): data is BaseFormXml => {
  const ajv = new Ajv()
  return ajv.validate(baseFormXmlSchema, data)
}

export class ExtractJsonFromSlovenskoSkXmlError extends Error {
  constructor(public type: ExtractJsonFromSlovenskoSkXmlErrorType) {
    super(type)
    this.name = 'ExtractJsonFromSlovenskoSkXmlError'
  }
}

export enum ExtractJsonFromSlovenskoSkXmlErrorType {
  InvalidXml = 'InvalidXml',
  XmlDoesntMatchSchema = 'XmlDoesntMatchSchema',
  WrongPospId = 'WrongPospId',
  InvalidJson = 'InvalidJson',
}

/**
 * Extracts JSON data and version from Slovensko.sk XML string
 * @returns Object containing parsed JSON data and version (defaults to '1.0.0' for backwards compatibility)
 */
export async function extractJsonFromSlovenskoSkXml(
  formDefinition: FormDefinitionSlovenskoSk,
  xmlString: string,
) {
  let parsedXml: any
  try {
    parsedXml = await parser.parseStringPromise(xmlString)
  } catch {
    throw new ExtractJsonFromSlovenskoSkXmlError(ExtractJsonFromSlovenskoSkXmlErrorType.InvalidXml)
  }

  if (!isBaseFormXml(parsedXml)) {
    throw new ExtractJsonFromSlovenskoSkXmlError(
      ExtractJsonFromSlovenskoSkXmlErrorType.XmlDoesntMatchSchema,
    )
  }

  const parsedXmlnsString = parseSlovenskoSkXmlnsString(parsedXml.eform.$.xmlns)
  if (!parsedXmlnsString) {
    throw new ExtractJsonFromSlovenskoSkXmlError(
      ExtractJsonFromSlovenskoSkXmlErrorType.XmlDoesntMatchSchema,
    )
  }

  if (parsedXmlnsString.pospID !== formDefinition.pospID) {
    throw new ExtractJsonFromSlovenskoSkXmlError(ExtractJsonFromSlovenskoSkXmlErrorType.WrongPospId)
  }

  let formDataJson: GenericObjectType
  try {
    formDataJson = JSON.parse(parsedXml.eform.Json[0])
  } catch {
    throw new ExtractJsonFromSlovenskoSkXmlError(ExtractJsonFromSlovenskoSkXmlErrorType.InvalidJson)
  }

  // For backwards compatibility:
  // - If version is missing or equals '1.0', return '1.0.0'
  // - Otherwise return the specified version
  const jsonVersionXml = parsedXml.eform.JsonVersion?.[0]
  const backwardsCompatibleDefault = !jsonVersionXml || jsonVersionXml === '1.0'
  const jsonVersion = backwardsCompatibleDefault ? '1.0.0' : jsonVersionXml

  if (!isValidVersion(jsonVersion)) {
    throw new ExtractJsonFromSlovenskoSkXmlError(ExtractJsonFromSlovenskoSkXmlErrorType.InvalidXml)
  }

  return { formDataJson, jsonVersion }
}
