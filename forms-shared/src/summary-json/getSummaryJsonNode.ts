import { GenericObjectType, RJSFSchema, UiSchema } from '@rjsf/utils'
import jsdom from 'jsdom'

import { getSummaryJson } from './getSummaryJson'
import { BaRjsfValidatorRegistry } from '../form-utils/validatorRegistry'

/**
 * Node.js implementation of `getSummaryJson`. Instead of `window.DOMParser` (which is not available
 * in Node), it uses compatible `jsdom` implementation. This will also work in browser, however
 * `jsdom` is huge - https://bundlephobia.com/package/jsdom, therefore it must never be included in
 * the client bundle.
 */
export const getSummaryJsonNode = (
  jsonSchema: RJSFSchema,
  uiSchema: UiSchema,
  data: GenericObjectType,
  validatorRegistry: BaRjsfValidatorRegistry,
) => {
  const jsDomInstance = new jsdom.JSDOM()
  const domParserInstance = new jsDomInstance.window.DOMParser()

  return getSummaryJson(jsonSchema, uiSchema, data, domParserInstance, validatorRegistry)
}
