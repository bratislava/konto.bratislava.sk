"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getArrayForOneToMany = exports.getValueAtJsonPath = exports.getValuesForFields = void 0;
const lodash_1 = require("lodash");
/**
 * Maps columns to their respective fields in SharePoint and fills them with data.
 *
 * @param {SharepointData} sharepointData - Object containing needed information to fill in the SharePoint table.
 * @param form - Form object containing the form data.
 * @param {JsonValue} jsonData - JSON data to use for filling the fields.
 * @param {Record<string, string>} fields - Mapping from the displayed name of the column in SharePoint to the API name.
 * @returns {Record<string, any>} - Object mapping API fields to their respective values.
 */
const getValuesForFields = (sharepointData, form, jsonData, fields) => {
    const result = {};
    Object.keys(fields).forEach((key) => {
        if (sharepointData.columnMap[key]) {
            const mapRecord = sharepointData.columnMap[key];
            switch (mapRecord.type) {
                case 'json_path':
                    const valueAtJsonPath = (0, exports.getValueAtJsonPath)(jsonData, mapRecord.info);
                    if (valueAtJsonPath === null) {
                        break;
                    }
                    result[fields[key]] = valueAtJsonPath;
                    break;
                case 'mag_number':
                    result[fields[key]] = form.ginisDocumentId ?? '';
                    break;
                case 'title':
                    result[fields[key]] = form.title;
                    break;
                default:
                    throw new TypeError(`Type provided in columnMap in sharepoint data is unknown.`);
            }
        }
        else {
            throw new Error(`Provided key ${key} not found in column map or extra keys. Slug: ${form.formDefinitionSlug}.`);
        }
    });
    return result;
};
exports.getValuesForFields = getValuesForFields;
const getValueAtJsonPath = (jsonFormData, info) => {
    let atPath = (0, lodash_1.get)(jsonFormData, info, null);
    if ((0, lodash_1.isObject)(atPath) && !(0, lodash_1.isArray)(atPath)) {
        throw new TypeError(`Only primitive types, and arrays of them can be retrieved. Retrieved: json object at path: ${info}.`);
    }
    if ((0, lodash_1.isArray)(atPath)) {
        if (atPath.some((item) => (0, lodash_1.isObject)(item))) {
            throw new TypeError(`Only primitive types, and arrays of them can be retrieved. Retrieved: array of non-primitives at path: ${info}.`);
        }
        atPath = atPath.map(String).join(', ');
    }
    return atPath;
};
exports.getValueAtJsonPath = getValueAtJsonPath;
const getArrayForOneToMany = (form, path) => {
    const atPath = (0, lodash_1.get)(form.jsonDataExtraDataOmitted, path, []);
    if (!Array.isArray(atPath)) {
        throw new TypeError(`Getting array data for oneToMany in form ${form.id} on path ${path} did not return array. Instead got value: ${atPath}`);
    }
    return atPath;
};
exports.getArrayForOneToMany = getArrayForOneToMany;
