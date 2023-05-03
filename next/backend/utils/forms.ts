import forms, { EFormKey, EFormValue } from '@backend/forms'
import { firstCharToUpper } from '@backend/utils/strings'
import { RJSFSchema } from '@rjsf/utils'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import * as cheerio from 'cheerio'
import { parseXml } from 'libxmljs2'
import { dropRight, find, last } from 'lodash'
import { parseStringPromise } from 'xml2js'
import { firstCharLowerCase } from 'xml2js/lib/processors'

import { getAllPossibleJsonSchemaProperties } from '../../frontend/utils/formStepper'
import { ajvFormats, ajvKeywords, JsonSchema } from '../../frontend/utils/formStepperData'
import { forceString } from '../../frontend/utils/general'
import logger from '../../frontend/utils/logger'

export type Json = any

const getFormatFromItems = (items: JsonSchema | JsonSchema[] | undefined): string | undefined => {
  return items && items !== true && !Array.isArray(items) ? items.format : undefined
}

export const buildXmlRecursive = (
  currentPath: string[],
  cheerioInstance: cheerio.CheerioAPI,
  node: unknown,
  jsonSchema: JsonSchema | undefined,
) => {
  const nodeName = firstCharToUpper(last(currentPath))
  const parentPath = dropRight(currentPath).join(' ')
  // we always edit the last element added - important for arrays in xml, where multiple nodes match the same path
  const parentNode = cheerioInstance(parentPath).last()
  if (parentNode.length === 0)
    throw new Error(`Error, found ${parentNode.length} nodes for path ${parentPath}`)
  if (Array.isArray(node)) {
    // arrays move us one level deeper in json, but do not cause change to xml on their own
    // this will make us add multiple nodes with same name at the same level
    // nested arrays will flatten
    node.forEach((item) => {
      buildXmlRecursive(currentPath, cheerioInstance, item, jsonSchema)
    })
  } else if (node && typeof node === 'object') {
    // objects add one level of nesting to xml
    parentNode.append(`<${nodeName}></${nodeName}>`)

    const properties = getAllPossibleJsonSchemaProperties(jsonSchema)
    if (Object.keys(properties).length === 0) {
      Object.keys(node).forEach((key) => {
        buildXmlRecursive(
          [...currentPath, firstCharToUpper(key)],
          cheerioInstance,
          node[key],
          properties[key],
        )
      })
    } else {
      Object.keys(properties).forEach((key) => {
        if (node[key] !== undefined) {
          buildXmlRecursive(
            [...currentPath, firstCharToUpper(key)],
            cheerioInstance,
            node[key],
            properties[key],
          )
        }
      })
    }
  } else if (node && typeof node === 'string') {
    let stringNode: string = node
    if (jsonSchema && jsonSchema !== true) {
      const format =
        jsonSchema.type === 'array' ? getFormatFromItems(jsonSchema.items) : jsonSchema.format
      if (format === 'ciselnik') {
        const ciselnikProperty: { id?: string } = typeof jsonSchema !== 'boolean' && 'ciselnik' in jsonSchema
          ? jsonSchema.ciselnik : {}
        stringNode = `<Code>${node}</Code><Name>${node}</Name><WsEnumCode>${
          ciselnikProperty?.id
        }</WsEnumCode>`
      } else if (format === 'file') {
        stringNode = `<Nazov>${node}</Nazov><Prilozena>true</Prilozena>`
      }
    }

    parentNode.append(`<${nodeName}>${stringNode}</${nodeName}>`)
  } else if (['number', 'boolean'].includes(typeof node)) {
    // only 'basic' types add actual information and not just nesting
    parentNode.append(`<${nodeName}>${String(node)}</${nodeName}>`)
  } else if (node == null) {
    // noop
  } else {
    logger.error('Erroneous node:', node)
    throw new Error(
      `Unexpeted node type/value at path ${currentPath.join(' ')}, see the node in logs above.`,
    )
  }
}

export const loadAndBuildXml = (xmlTemplate: string, data: Json, jsonSchema: JsonSchema) => {
  const $ = cheerio.load(xmlTemplate, { xmlMode: true, decodeEntities: false })
  buildXmlRecursive(['E-form', 'Body'], $, data, jsonSchema)
  return $.html()
}

export const getJsonSchemaNodeAtPath = (
  jsonSchema: JsonSchema,
  path: string[],
): JsonSchema | null => {
  let currentNode = jsonSchema
  // eslint-disable-next-line no-restricted-syntax
  for (const key of path) {
    const properties = getAllPossibleJsonSchemaProperties(currentNode)
    currentNode = properties[key]
    if (!currentNode) return null
  }
  return currentNode
}

export const removeNeedlessXmlTransformArraysRecursive = (
  obj: unknown,
  path: string[],
  schema: JsonSchema,
) => {
  if (typeof obj !== 'object') {
    return obj
  }
  const transformedObj = obj

  Object.entries(transformedObj).forEach(([key, value]) => {
    const newPath = [...path, key]
    // skip index of array
    if (Number.isNaN(Number(key))) {
      const childSchema = getJsonSchemaNodeAtPath(schema, newPath)
      if (!childSchema || childSchema === true) {
        if (Array.isArray(value) && value.length < 2) {
          if (value[0] === 'true') {
            transformedObj[key] = true
          } else if (value[0] === 'false') {
            transformedObj[key] = false
          } else {
            const numValue = Number(value[0])
            if (
              typeof value[0] === 'string' &&
              !value[0].startsWith('+') &&
              !Number.isNaN(numValue)
            ) {
              transformedObj[key] = numValue
            } else {
              const [firstElement] = value
              transformedObj[key] = firstElement
            }
          }
        }
      } else if (childSchema.type === 'array') {
        const format = getFormatFromItems(childSchema.items)
        if (format === 'file' && Array.isArray(value)) {
          transformedObj[key] = value.map((x: { nazov: unknown[] }) => x.nazov[0] ?? '')
        } else if (format === 'ciselnik' && Array.isArray(value)) {
          transformedObj[key] = value.map((x: { code: unknown[] }) => x.code[0] ?? '')
        }
      } else if (childSchema.type === 'string') {
        /* eslint-disable @typescript-eslint/no-unsafe-member-access */
        if (childSchema.format === 'file') {
          const [firstNazov] = value[0].nazov
          transformedObj[key] = firstNazov
        } else if (childSchema.format === 'ciselnik') {
          const [firstCode] = value[0].code
          transformedObj[key] = firstCode
        } else {
          const [firstElement] = value
          transformedObj[key] = firstElement
        }
      } else if (find(['integer', 'int32', 'int64'], (t) => t === childSchema.type)) {
        transformedObj[key] = Number.parseInt(String(value[0]), 10)
      } else if (find(['float', 'double', 'number'], (t) => t === childSchema.type)) {
        transformedObj[key] = Number.parseFloat(String(value[0]))
      } else if (childSchema.type === 'boolean') {
        // again very forgiving in what we can receive
        transformedObj[key] = value[0] == null ? null : value[0] === 'false' ? false : Boolean(value[0])
      } else {
        const [firstElement] = value
        transformedObj[key] = firstElement
      }
      /* eslint-enable @typescript-eslint/no-unsafe-member-access */
    }

    removeNeedlessXmlTransformArraysRecursive(transformedObj[key], newPath, schema)
  })

  return transformedObj
}

export const xmlToJson = async (data: string, jsonSchema: JsonSchema): Promise<RJSFSchema> => {
  // xml2js has issues when top level element isn't a single node
  const wrappedXmlString = `<wrapper>${data}</wrapper>`
  const obj: { wrapper: object } = await parseStringPromise(wrappedXmlString, {
    tagNameProcessors: [firstCharLowerCase],
  })
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const body: RJSFSchema = obj.wrapper['e-form'] ? obj.wrapper['e-form'][0].body[0] : obj.wrapper
  removeNeedlessXmlTransformArraysRecursive(body, [], jsonSchema)
  return body
}

export const validateDataWithJsonSchema = async (data: any, schema: any) => {
  const ajv = new Ajv({
    keywords: ajvKeywords,
    formats: ajvFormats,
  })
  addFormats(ajv)

  const validate = ajv.compile(schema)

  try {
    validate(data)
    return validate.errors || []
  } catch (error) {
    if (!(error instanceof Ajv.ValidationError)) throw error

    return error.errors
  }
}

export const validateDataWithXsd = (data: string, xsd: string) => {
  const xsdDoc = parseXml(xsd)
  const xmlDoc = parseXml(data)

  xmlDoc.validate(xsdDoc)
  return xmlDoc.validationErrors
}

export const getEform = (id: string | string[] | undefined): EFormValue => {
  const formSlug: EFormKey = forceString(id) as any
  const eform: EFormValue = forms[formSlug] as EFormValue

  if (!eform) throw new Error(`Invalid form name - validateFormName returned: ${formSlug}`)
  return eform
}
