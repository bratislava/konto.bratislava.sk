import { SharepointData } from '../definitions/sharepointTypes';
import { JsonValue } from './types';
/**
 * Maps columns to their respective fields in SharePoint and fills them with data.
 *
 * @param {SharepointData} sharepointData - Object containing needed information to fill in the SharePoint table.
 * @param form - Form object containing the form data.
 * @param {JsonValue} jsonData - JSON data to use for filling the fields.
 * @param {Record<string, string>} fields - Mapping from the displayed name of the column in SharePoint to the API name.
 * @returns {Record<string, any>} - Object mapping API fields to their respective values.
 */
export declare const getValuesForFields: (sharepointData: SharepointData, form: {
    ginisDocumentId: string | null;
    formDefinitionSlug: string;
    title: string;
}, jsonData: JsonValue, fields: Record<string, string>) => Record<string, any>;
export declare const getValueAtJsonPath: (jsonFormData: JsonValue, info: string) => JsonValue;
export declare const getArrayForOneToMany: (form: {
    jsonDataExtraDataOmitted: JsonValue;
    id: string;
}, path: string) => Array<JsonValue>;
