// TODO publish to @types: https://github.com/DefinitelyTyped/DefinitelyTyped
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { FormDefinition } from '@backend/forms/types'
import { loadAndValidate } from '@bratislava/json-schema-xsd-tools'
import { describe } from '@jest/globals'
import each from 'jest-each'

import formDefinitions, { FormDefinitionsKeys } from '../backend/forms'
import {
  loadAndBuildXml,
  validateDataWithJsonSchema,
  validateDataWithXsd,
  xmlToJson,
} from '../backend/utils/forms'
import { transformSaxon } from '../backend/utils/xslt'

const excludeKeys = new Set(['test'])
describe('forms test', () => {
  each(Object.keys(formDefinitions).filter((k: string) => !excludeKeys.has(k))).test(
    'form %s',
    async (key: FormDefinitionsKeys) => {
      const eform = formDefinitions[key] as FormDefinition

      const xml = loadAndBuildXml(eform.xmlTemplate, eform.data, eform.schema)

      const jsonErrors = await validateDataWithJsonSchema(eform.data, eform.schema)
      expect(jsonErrors).toHaveLength(0)

      const xmlErrors = validateDataWithXsd(xml, eform.xsd)
      expect(xmlErrors).toHaveLength(0)

      const text = await transformSaxon(eform.textStylesheet, xml)
      expect(text).toBeTruthy()

      const html = await transformSaxon(eform.htmlStylesheet, xml)
      expect(html).toBeTruthy()

      const json = await xmlToJson(xml, eform.schema)
      expect(eform.data).toEqual(json)

      const errors = loadAndValidate(eform.xsd, eform.schema)
      expect(errors).toHaveLength(0)
    },
  )
})
