import { Injectable, Logger } from '@nestjs/common'
import { GenericObjectType } from '@rjsf/utils'
import * as cheerio from 'cheerio'
import { dropRight, find, last } from 'lodash'

import ThrowerErrorGuard from '../../utils/guards/thrower-error.guard'
import { JsonSchema } from '../../utils/types/global'
import escapeXml from '../../utils/xml'
import {
  ConvertErrorsEnum,
  ConvertErrorsResponseEnum,
} from '../errors/convert.errors.enum'

interface Ciselnik {
  id?: string
}

@Injectable()
export default class JsonXmlConvertService {
  private readonly logger: Logger

  constructor(private readonly throwerErrorGuard: ThrowerErrorGuard) {
    this.logger = new Logger('JsonXmlConvertService')
  }

  private firstCharToUpper(input?: string): string {
    if (!input) {
      return ''
    }

    return input.charAt(0).toUpperCase() + input.slice(1)
  }

  private getFormatFromItems(
    items?: JsonSchema | JsonSchema[],
  ): string | undefined {
    return items && items !== true && !Array.isArray(items)
      ? items.format
      : undefined
  }

  private getAllPossibleJsonSchemaProperties(
    jsonSchema?: JsonSchema,
  ): JsonSchema {
    if (!jsonSchema || jsonSchema === true) {
      return {}
    }

    const properties: JsonSchema = {}
    if (jsonSchema.properties) {
      Object.assign(properties, { ...jsonSchema.properties })
    }

    if (jsonSchema.if && jsonSchema.then) {
      Object.assign(
        properties,
        this.getAllPossibleJsonSchemaProperties(jsonSchema.then),
      )
    }
    if (jsonSchema.if && jsonSchema.else) {
      Object.assign(
        properties,
        this.getAllPossibleJsonSchemaProperties(jsonSchema.else),
      )
    }

    jsonSchema?.allOf?.forEach((s) => {
      Object.assign(properties, this.getAllPossibleJsonSchemaProperties(s))
    })

    jsonSchema?.oneOf?.forEach((s) => {
      Object.assign(properties, this.getAllPossibleJsonSchemaProperties(s))
    })

    jsonSchema?.anyOf?.forEach((s) => {
      Object.assign(properties, this.getAllPossibleJsonSchemaProperties(s))
    })

    return properties
  }

  // TODO this disable
  // eslint-disable-next-line sonarjs/cognitive-complexity
  buildXmlRecursive(
    currentPath: string[],
    cheerioInstance: cheerio.CheerioAPI,
    node: unknown,
    jsonSchema?: JsonSchema,
  ): void {
    const nodeName = this.firstCharToUpper(last(currentPath))
    const parentPath = dropRight(currentPath).join(' ')
    // we always edit the last element added - important for arrays in xml, where multiple nodes match the same path
    const parentNode = cheerioInstance(parentPath).last()
    if (parentNode.length === 0) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        ConvertErrorsEnum.ELEMENT_NOT_FOUND,
        `${ConvertErrorsResponseEnum.ELEMENT_NOT_FOUND}: Found ${parentNode.length} nodes for path ${parentPath}`,
      )
    }
    if (Array.isArray(node)) {
      // arrays move us one level deeper in json, but do not cause change to xml on their own
      // this will make us add multiple nodes with same name at the same level
      // nested arrays will flatten
      node.forEach((item) => {
        this.buildXmlRecursive(currentPath, cheerioInstance, item, jsonSchema)
      })
    } else if (node && typeof node === 'object') {
      // skip empty node
      if (Object.keys(node).length > 0) {
        // objects add one level of nesting to xml
        parentNode.append(`<${nodeName}></${nodeName}>`)

        const properties = this.getAllPossibleJsonSchemaProperties(jsonSchema)
        if (Object.keys(properties).length === 0) {
          Object.entries(node).forEach(([key, value]) => {
            this.buildXmlRecursive(
              [...currentPath, this.firstCharToUpper(key)],
              cheerioInstance,
              value,
              properties[key as keyof JsonSchema],
            )
          })
        } else {
          Object.keys(properties).forEach((key) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const value = (node as GenericObjectType)[key]
            if (value !== undefined) {
              this.buildXmlRecursive(
                [...currentPath, this.firstCharToUpper(key)],
                cheerioInstance,
                value,
                properties[key as keyof JsonSchema],
              )
            }
          })
        }
      }
    } else if (node && typeof node === 'string') {
      const xmlEscapedNode = escapeXml(node)
      let stringNode: string = xmlEscapedNode
      if (jsonSchema && jsonSchema !== true) {
        const format =
          jsonSchema.type === 'array'
            ? this.getFormatFromItems(jsonSchema.items)
            : jsonSchema.format
        if (format === 'ciselnik') {
          const ciselnikProperty: Ciselnik =
            typeof jsonSchema !== 'boolean' && 'ciselnik' in jsonSchema
              ? (jsonSchema.ciselnik as Ciselnik)
              : ({} as Ciselnik)
          stringNode = `<Code>${xmlEscapedNode}</Code><Name>${xmlEscapedNode}</Name><WsEnumCode>${String(
            ciselnikProperty?.id,
          )}</WsEnumCode>`
        } else if (format === 'file') {
          stringNode = `<Nazov>${xmlEscapedNode}</Nazov><Prilozena>true</Prilozena>`
        }
      }

      parentNode.append(`<${nodeName}>${stringNode}</${nodeName}>`)
    } else if (['number', 'boolean'].includes(typeof node)) {
      // only 'basic' types add actual information and not just nesting
      parentNode.append(`<${nodeName}>${String(node)}</${nodeName}>`)
    } else if (node == null) {
      // noop
    } else {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        ConvertErrorsEnum.UNPROCESSABLE_TYPE,
        `${
          ConvertErrorsResponseEnum.UNPROCESSABLE_TYPE
        } At path ${currentPath.join(' ')}, erroneous node: ${<string>node}.`,
      )
    }
  }

  getJsonSchemaNodeAtPath(
    jsonSchema: JsonSchema,
    path: string[],
  ): JsonSchema | null {
    let currentNode = jsonSchema
    // eslint-disable-next-line no-restricted-syntax
    for (const key of path) {
      const properties = this.getAllPossibleJsonSchemaProperties(currentNode)
      currentNode = properties[key as keyof JsonSchema]
      if (!currentNode) return null
    }
    return currentNode
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  removeNeedlessXmlTransformArraysRecursive(
    obj: unknown,
    path: string[],
    schema: JsonSchema,
  ): GenericObjectType {
    if (typeof obj !== 'object' || !obj) {
      return {}
    }
    const transformedObj: GenericObjectType = obj

    Object.entries(transformedObj).forEach(([key, value]) => {
      const newPath = [...path, key]
      // skip index of array
      if (Number.isNaN(Number(key))) {
        const childSchema = this.getJsonSchemaNodeAtPath(schema, newPath)
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
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const [firstElement] = value
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                transformedObj[key] = firstElement
              }
            }
          }
        } else if (childSchema.type === 'array') {
          const format = this.getFormatFromItems(childSchema.items)
          if (format === 'file' && Array.isArray(value)) {
            transformedObj[key] = value.map(
              (x: { nazov: unknown[] }) => x.nazov[0] ?? '',
            )
          } else if (format === 'ciselnik' && Array.isArray(value)) {
            transformedObj[key] = value.map(
              (x: { code: unknown[] }) => x.code[0] ?? '',
            )
          }
        } else if (childSchema.type === 'string') {
          /* eslint-disable @typescript-eslint/no-unsafe-member-access */
          if (childSchema.format === 'file') {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const [firstNazov] = value[0].nazov
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            transformedObj[key] = firstNazov
          } else if (childSchema.format === 'ciselnik') {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const [firstCode] = value[0].code
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            transformedObj[key] = firstCode
          } else {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const [firstElement] = value
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            transformedObj[key] = firstElement
          }
        } else if (
          find(['integer', 'int32', 'int64'], (t) => t === childSchema.type)
        ) {
          transformedObj[key] = Number.parseInt(String(value[0]), 10)
        } else if (
          find(['float', 'double', 'number'], (t) => t === childSchema.type)
        ) {
          transformedObj[key] = Number.parseFloat(String(value[0]))
        } else if (childSchema.type === 'boolean') {
          // again very forgiving in what we can receive
          transformedObj[key] =
            value[0] == null
              ? null
              : value[0] === 'false'
                ? false
                : Boolean(value[0])
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const [firstElement] = value
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          transformedObj[key] = firstElement
        }
        /* eslint-enable @typescript-eslint/no-unsafe-member-access */
      }

      this.removeNeedlessXmlTransformArraysRecursive(
        transformedObj[key],
        newPath,
        schema,
      )
    })

    return transformedObj
  }
}
