"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeEnumOptionsMetadata = exports.createEnumMetadata = exports.createEnumSchemaDefaultMultiple = exports.createEnumSchemaDefault = exports.createEnumSchemaEnum = void 0;
// All oneOfs needed to be changed to enum because of this bug:
// https://jsonforms.discourse.group/t/function-nested-too-deeply-error-when-enum-has-many-options/1451
// For many options (250) it worked OK in Chrome, but in Firefox it was throwing an error:
// Form validation failed
// Array [ 0: Object { stack: "function nested too deeply", message: "Neznáma chyba" } ]
const createEnumSchemaEnum = (list) => list.map(({ value }) => value);
exports.createEnumSchemaEnum = createEnumSchemaEnum;
const createEnumSchemaDefault = (list) => list.find(({ isDefault }) => isDefault)?.value;
exports.createEnumSchemaDefault = createEnumSchemaDefault;
const createEnumSchemaDefaultMultiple = (list) => list.filter(({ isDefault }) => isDefault).map(({ value }) => value);
exports.createEnumSchemaDefaultMultiple = createEnumSchemaDefaultMultiple;
const createEnumMetadata = (list) => list.map(({ value, label, description }) => ({ value, label, description }));
exports.createEnumMetadata = createEnumMetadata;
const mergeEnumOptionsMetadata = (enumOptions, enumMetadata) => enumOptions.map((option) => {
    const metadata = enumMetadata.find((metadata) => metadata.value === option.value);
    if (metadata) {
        return { ...metadata, value: option.value };
    }
    return { value: option.value, label: '' };
});
exports.mergeEnumOptionsMetadata = mergeEnumOptionsMetadata;
