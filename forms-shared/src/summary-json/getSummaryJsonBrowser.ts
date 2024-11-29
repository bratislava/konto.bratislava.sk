import { GenericObjectType, RJSFSchema, UiSchema } from '@rjsf/utils'

import { getSummaryJson } from './getSummaryJson'
import { BaRjsfValidatorRegistry } from '../form-utils/validatorRegistry'

/**
 * Browser implementation of `getSummaryJson`. It cannot be used in Node.js environment, because
 * `window.DOMParser` is not available there.
 */
export const getSummaryJsonBrowser = (
  jsonSchema: RJSFSchema,
  uiSchema: UiSchema,
  data: GenericObjectType,
  validatorRegistry: BaRjsfValidatorRegistry,
) => {
  const domParserInstance = new window.DOMParser()

  return getSummaryJson(jsonSchema, uiSchema, data, domParserInstance, validatorRegistry)
}
