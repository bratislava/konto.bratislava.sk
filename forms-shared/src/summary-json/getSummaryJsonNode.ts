import jsdom from 'jsdom'

import { getSummaryJson, GetSummaryJsonParams } from './getSummaryJson'

/**
 * Node.js implementation of `getSummaryJson`. Instead of `window.DOMParser` (which is not available
 * in Node), it uses compatible `jsdom` implementation. This will also work in browser, however
 * `jsdom` is huge - https://bundlephobia.com/package/jsdom, therefore it must never be included in
 * the client bundle.
 */
export const getSummaryJsonNode = ({
  schema,
  formData,
  validatorRegistry,
}: GetSummaryJsonParams) => {
  const jsDomInstance = new jsdom.JSDOM()
  const domParserInstance = new jsDomInstance.window.DOMParser()

  return getSummaryJson({ schema, formData, domParserInstance, validatorRegistry })
}
