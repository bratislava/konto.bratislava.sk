import { FormDefinitionSlovenskoSk } from '../definitions/formDefinitionTypes'
import { Parser } from 'xml2js'
import Ajv from 'ajv'
import { parseSlovenskoSkXmlnsString } from './urls'

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
            'xmlns:xsi': {
              type: 'string',
              const: 'http://www.w3.org/2001/XMLSchema-instance',
            },
          },
          required: ['xmlns', 'xmlns:xsi'],
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

type BaseFormXmlSchema = {
  eform: {
    $: {
      xmlns: string
      'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance'
    }
    Json: [string]
  }
}

const parser = new Parser({ explicitArray: true })

const isBaseFormXmlSchema = (data: any): data is BaseFormXmlSchema => {
  const ajv = new Ajv()
  return ajv.validate(baseFormXmlSchema, data)
}

export enum ExtractJsonFromSlovenskoSkXmlError {
  InvalidXml,
  XmlDoesntMatchSchema,
  WrongPospId,
  InvalidJson,
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
    parsedXml = await parser.parseStringPromise(xmlString)
  } catch {
    throw ExtractJsonFromSlovenskoSkXmlError.InvalidXml
  }

  if (!isBaseFormXmlSchema(parsedXml)) {
    throw ExtractJsonFromSlovenskoSkXmlError.XmlDoesntMatchSchema
  }

  const parsedXmlnsString = parseSlovenskoSkXmlnsString(parsedXml.eform.$.xmlns)
  if (!parsedXmlnsString) {
    throw ExtractJsonFromSlovenskoSkXmlError.XmlDoesntMatchSchema
  }

  if (parsedXmlnsString.pospID !== formDefinition.pospID) {
    throw ExtractJsonFromSlovenskoSkXmlError.WrongPospId
  }

  try {
    return JSON.parse(parsedXml.eform.Json[0])
  } catch {
    throw ExtractJsonFromSlovenskoSkXmlError.InvalidJson
  }
}
