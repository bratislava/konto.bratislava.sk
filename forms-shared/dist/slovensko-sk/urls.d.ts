import { FormDefinitionSlovenskoSk } from '../definitions/formDefinitionTypes';
export declare const getSlovenskoSkXmlns: (formDefinition: FormDefinitionSlovenskoSk) => string;
export declare const getSlovenskoSkMetaIdentifier: (formDefinition: FormDefinitionSlovenskoSk) => string;
export declare function parseSlovenskoSkXmlnsString(xmlnsString: string): {
    pospID: string;
    pospVersion: string;
} | null;
