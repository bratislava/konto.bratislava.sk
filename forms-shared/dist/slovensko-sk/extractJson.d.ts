import { FormDefinitionSlovenskoSk } from '../definitions/formDefinitionTypes';
import { GenericObjectType } from '@rjsf/utils';
export declare class ExtractJsonFromSlovenskoSkXmlError extends Error {
    type: ExtractJsonFromSlovenskoSkXmlErrorType;
    constructor(type: ExtractJsonFromSlovenskoSkXmlErrorType);
}
export declare enum ExtractJsonFromSlovenskoSkXmlErrorType {
    InvalidXml = "InvalidXml",
    XmlDoesntMatchSchema = "XmlDoesntMatchSchema",
    WrongPospId = "WrongPospId",
    InvalidJson = "InvalidJson"
}
/**
 * Extracts JSON data from Slovensko.sk XML string
 */
export declare function extractJsonFromSlovenskoSkXml(formDefinition: FormDefinitionSlovenskoSk, xmlString: string): Promise<GenericObjectType>;
