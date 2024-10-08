import { FormDefinitionSlovenskoSk } from '../definitions/formDefinitionTypes'
import { parseStringPromise } from 'xml2js'
import Ajv from 'ajv'
import { parseSlovenskoSkXmlnsString } from './urls'
import { GenericObjectType } from '@rjsf/utils'

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
        Json: {
          type: 'string',
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
    Json: string
  }
}

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
 * Extracts JSON data from Slovensko.sk XML string
 *
 * TODO: Consider adding `omitExtraData`
 */
export async function extractJsonFromSlovenskoSkXml(
  formDefinition: FormDefinitionSlovenskoSk,
  xmlString: string,
) {
  let parsedXml: any
  try {
    parsedXml = await parseStringPromise(xmlString, { explicitArray: false })
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

  try {
    return JSON.parse(parsedXml.eform.Json) as GenericObjectType
  } catch {
    throw new ExtractJsonFromSlovenskoSkXmlError(ExtractJsonFromSlovenskoSkXmlErrorType.InvalidJson)
  }
}
