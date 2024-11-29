import { GenericObjectType, RJSFSchema, UiSchema } from '@rjsf/utils';
import { BaRjsfValidatorRegistry } from '../form-utils/validatorRegistry';
/**
 * Browser implementation of `getSummaryJson`. It cannot be used in Node.js environment, because
 * `window.DOMParser` is not available there.
 */
export declare const getSummaryJsonBrowser: (jsonSchema: RJSFSchema, uiSchema: UiSchema, data: GenericObjectType, validatorRegistry: BaRjsfValidatorRegistry) => import("./summaryJsonTypes").SummaryJsonForm;
