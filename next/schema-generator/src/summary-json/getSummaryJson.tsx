import { GenericObjectType, RJSFSchema, UiSchema } from '@rjsf/utils'
import React from 'react'
import { renderToString } from 'react-dom/server'

import {
  SummaryJsonArray,
  SummaryJsonArrayItem,
  SummaryJsonElement,
  SummaryJsonField,
  SummaryJsonForm,
  SummaryJsonStep,
  SummaryJsonType,
} from './summaryJsonTypes'
import SummaryXmlForm, { SummaryXmlFormTag } from './SummaryXmlForm'

const allowedChildren: Record<SummaryXmlFormTag, SummaryXmlFormTag[]> = {
  [SummaryXmlFormTag.Form]: [SummaryXmlFormTag.Step],
  [SummaryXmlFormTag.Step]: [SummaryXmlFormTag.Field, SummaryXmlFormTag.Array],
  [SummaryXmlFormTag.Array]: [SummaryXmlFormTag.ArrayItem],
  [SummaryXmlFormTag.ArrayItem]: [SummaryXmlFormTag.Field, SummaryXmlFormTag.Array],
  [SummaryXmlFormTag.Field]: [],
}

function isAllowedTag(tag: string): tag is SummaryXmlFormTag {
  return Object.values(SummaryXmlFormTag).includes(tag as SummaryXmlFormTag)
}

const assertElement = (element: Element) => {
  const tagName = element.tagName.toLowerCase()
  if (!isAllowedTag(tagName)) {
    throw new Error(`Invalid tag ${tagName}`)
  }

  Array.from(element.children).forEach((child) => {
    const childTagName = child.tagName.toLowerCase()
    if (!isAllowedTag(childTagName)) {
      throw new Error(`Invalid child tag ${childTagName}`)
    }

    if (!allowedChildren[tagName].includes(childTagName as SummaryXmlFormTag)) {
      throw new Error(`Invalid child tag ${childTagName} for ${tagName}`)
    }
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getJsonParsedObject = <Key extends string, Value extends any>(
  key: Key,
  attributeValue: string | null,
) => {
  // `attributeValue` contains stringified JSON, if XML attribute has no value `getAttribute` returns `null`
  if (attributeValue === null) {
    return null
  }

  return {
    [key]: JSON.parse(attributeValue) as Value,
  }
}

function parseXml(domParserInstance: DOMParser, xmlString: string) {
  const doc = domParserInstance.parseFromString(xmlString, 'text/html')
  const root = doc.documentElement.querySelector(SummaryXmlFormTag.Form)

  if (root == null) {
    throw new Error('No root element found.')
  }

  function elementToJson(element: Element): SummaryJsonElement {
    assertElement(element)

    const tagName = element.tagName.toLowerCase() as SummaryXmlFormTag
    const children = Array.from(element.children).map((child) => elementToJson(child))

    switch (tagName) {
      case SummaryXmlFormTag.Form:
        return {
          type: SummaryJsonType.Form,
          id: element.getAttribute('id'),
          steps: children,
        } as SummaryJsonForm

      case SummaryXmlFormTag.Step:
        return {
          type: SummaryJsonType.Step,
          id: element.getAttribute('id'),
          title: element.getAttribute('title'),
          children,
        } as SummaryJsonStep

      case SummaryXmlFormTag.Field:
        const valueRaw = element.getAttribute('value')
        const displayValuesRaw = element.getAttribute('display-values')

        return {
          type: SummaryJsonType.Field,
          id: element.getAttribute('id'),
          label: element.getAttribute('label'),
          ...getJsonParsedObject('value', valueRaw),
          ...getJsonParsedObject('displayValues', displayValuesRaw),
        } as SummaryJsonField

      case SummaryXmlFormTag.Array:
        return {
          type: SummaryJsonType.Array,
          id: element.getAttribute('id'),
          title: element.getAttribute('title'),
          items: children,
        } as SummaryJsonArray

      case SummaryXmlFormTag.ArrayItem:
        return {
          type: SummaryJsonType.ArrayItem,
          id: element.getAttribute('id'),
          title: element.getAttribute('title'),
          children,
        } as SummaryJsonArrayItem

      default:
        throw new Error(`Invalid tag ${tagName}`)
    }
  }

  return elementToJson(root) as SummaryJsonForm
}

export const getSummaryJson = (
  jsonSchema: RJSFSchema,
  uiSchema: UiSchema,
  data: GenericObjectType,
  domParserInstance: DOMParser,
) => {
  // eslint-disable-next-line testing-library/render-result-naming-convention
  const renderedString = renderToString(
    <SummaryXmlForm schema={jsonSchema} uiSchema={uiSchema} formData={data} />,
  )

  return parseXml(domParserInstance, renderedString)
}
