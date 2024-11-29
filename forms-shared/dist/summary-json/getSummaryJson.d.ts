import { GenericObjectType, RJSFSchema, UiSchema } from '@rjsf/utils';
import { SummaryJsonForm } from './summaryJsonTypes';
import { BaRjsfValidatorRegistry } from '../form-utils/validatorRegistry';
/**
 * Renders the summary form and parses the XML into a JSON object.
 */
export declare const getSummaryJson: (jsonSchema: RJSFSchema, uiSchema: UiSchema, data: GenericObjectType, domParserInstance: DOMParser, validatorRegistry: BaRjsfValidatorRegistry) => SummaryJsonForm;
