import { FormDefinitionSlovenskoSk } from '../definitions/formDefinitionTypes';
import { GenericObjectType } from '@rjsf/utils';
import { FormsBackendFile } from '../form-files/serverFilesTypes';
import { BaRjsfValidatorRegistry } from '../form-utils/validatorRegistry';
/**
 * Generates an empty Slovensko SK XML object that can be built with "xml2js" to create a valid XML.
 */
export declare function getEmptySlovenskoSkXmlObject(formDefinition: FormDefinitionSlovenskoSk): {
    eform: {
        $: {
            xmlns: string;
            'xmlns:xsi': string;
        };
    };
};
/**
 * Generates a Slovensko SK XML object that can be built with "xml2js" to create a valid XML.
 */
export declare function generateSlovenskoSkXmlObject(formDefinition: FormDefinitionSlovenskoSk, formData: GenericObjectType, validatorRegistry: BaRjsfValidatorRegistry, serverFiles?: FormsBackendFile[]): Promise<{
    eform: {
        $: {
            xmlns: string;
            'xmlns:xsi': string;
        };
    };
}>;
