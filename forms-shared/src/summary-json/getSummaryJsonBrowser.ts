import { getSummaryJson, GetSummaryJsonParams } from './getSummaryJson'

/**
 * Browser implementation of `getSummaryJson`. It cannot be used in Node.js environment, because
 * `window.DOMParser` is not available there.
 */
export const getSummaryJsonBrowser = ({
  schema,
  formData,
  validatorRegistry,
}: GetSummaryJsonParams) => {
  const domParserInstance = new window.DOMParser()

  return getSummaryJson({ schema, formData, domParserInstance, validatorRegistry })
}
