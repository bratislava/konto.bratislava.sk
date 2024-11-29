import { GenericObjectType, RJSFSchema, UiSchema } from '@rjsf/utils';
import { BaRjsfValidatorRegistry } from '../form-utils/validatorRegistry';
/**
 * Node.js implementation of `getSummaryJson`. Instead of `window.DOMParser` (which is not available
 * in Node), it uses compatible `jsdom` implementation. This will also work in browser, however
 * `jsdom` is huge - https://bundlephobia.com/package/jsdom, therefore it must never be included in
 * the client bundle.
 */
export declare const getSummaryJsonNode: (jsonSchema: RJSFSchema, uiSchema: UiSchema, data: GenericObjectType, validatorRegistry: BaRjsfValidatorRegistry) => import("./summaryJsonTypes").SummaryJsonForm;
