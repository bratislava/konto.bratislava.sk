import { GenericObjectType } from '@rjsf/utils';
import { FormDefinition } from '../definitions/formDefinitionTypes';
export declare const renderFormTemplate: (formData: GenericObjectType, templateString: string, logError?: boolean) => string | null;
export declare const renderFormAdditionalInfo: (formDefinition: FormDefinition, formDataJson: GenericObjectType, logError?: boolean) => string | null;
