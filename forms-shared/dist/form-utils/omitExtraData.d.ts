import { GenericObjectType, RJSFSchema } from '@rjsf/utils';
import { BaRjsfValidatorRegistry } from './validatorRegistry';
/**
 * Omits extra data from form data.
 *
 * Until https://github.com/rjsf-team/react-jsonschema-form/issues/4081 is resolved this is the only way how to omit
 * extra data from form data.
 */
export declare function omitExtraData(schema: RJSFSchema, formData: GenericObjectType, validatorRegistry: BaRjsfValidatorRegistry): GenericObjectType;
