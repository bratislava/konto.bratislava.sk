"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSummaryDisplayValues = exports.SummaryDisplayValueType = void 0;
const date_1 = require("@internationalized/date");
const uiOptionsTypes_1 = require("../generator/uiOptionsTypes");
const ajvFormats_1 = require("../form-utils/ajvFormats");
const optionItems_1 = require("../generator/optionItems");
var SummaryDisplayValueType;
(function (SummaryDisplayValueType) {
    SummaryDisplayValueType["String"] = "String";
    SummaryDisplayValueType["File"] = "File";
    SummaryDisplayValueType["Invalid"] = "Invalid";
    SummaryDisplayValueType["None"] = "None";
})(SummaryDisplayValueType || (exports.SummaryDisplayValueType = SummaryDisplayValueType = {}));
const createStringValue = (value) => ({
    type: SummaryDisplayValueType.String,
    value,
});
const createFileValue = (id) => ({
    type: SummaryDisplayValueType.File,
    id,
});
const invalidValue = {
    type: SummaryDisplayValueType.Invalid,
};
const noneValue = {
    type: SummaryDisplayValueType.None,
};
const bratislavaTimeZone = 'Europe/Bratislava';
// TODO: Use shared date formatter
const dateFormatter = new date_1.DateFormatter('sk-SK', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    timeZone: bratislavaTimeZone,
});
/**
 * Returns an array of values to display in the summary for a given field.
 *
 * Because some widgets can have multiple values (e.g. multi-select) it is easier to always return an array. If the
 * field has no value, the array will contain a single value with the type `None`. Files have a special type `File`
 * because they are displayed in their own way in the summary.
 *
 * The function returns value to display which doesn't have to be a valid value for the field, each widget type
 * requires its own treatment, some examples:
 *  - a number field with minimum value of 5 can have a value of 3, which is displayed as "3"
 *  - a number field with value "not-a-number" or {} is not a valid number, which is displayed as invalid
 *  - a string field with type "email" can have a value "not-an-email", which is displayed as "not-an-email"
 *  - a select field with options ["a", "b"] and its respective labels cannot have a value "c", which is displayed as
 *  invalid
 *  - a file upload field with a value that is not a valid UUID is displayed as invalid
 *  - a date field with a value that is not a valid date is displayed as invalid
 */
const getSummaryDisplayValues = (
// eslint-disable-next-line @typescript-eslint/no-explicit-any
value, widgetType, schema, uiOptions) => {
    const isNullOrUndefined = value == null;
    if (isNullOrUndefined) {
        return [noneValue];
    }
    if (widgetType === uiOptionsTypes_1.BaWidgetType.Select || widgetType === uiOptionsTypes_1.BaWidgetType.RadioGroup) {
        const uiOptionsWithType = uiOptions;
        const mergedMetadata = (0, optionItems_1.mergeEnumOptionsMetadata)(uiOptionsWithType.enumOptions, uiOptionsWithType.enumMetadata);
        const option = mergedMetadata.find((optionInner) => optionInner.value === value);
        if (!option) {
            return [invalidValue];
        }
        return [createStringValue(option.label)];
    }
    if (widgetType === uiOptionsTypes_1.BaWidgetType.SelectMultiple || widgetType === uiOptionsTypes_1.BaWidgetType.CheckboxGroup) {
        if (!Array.isArray(value)) {
            return [invalidValue];
        }
        if (value.length === 0) {
            return [noneValue];
        }
        const uiOptionsWithType = uiOptions;
        const mergedMetadata = (0, optionItems_1.mergeEnumOptionsMetadata)(uiOptionsWithType.enumOptions, uiOptionsWithType.enumMetadata);
        return value.map((item) => {
            const option = mergedMetadata.find((optionInner) => optionInner.value === item);
            if (!option) {
                return invalidValue;
            }
            return createStringValue(option.label);
        });
    }
    if (widgetType === uiOptionsTypes_1.BaWidgetType.Input || widgetType === uiOptionsTypes_1.BaWidgetType.TextArea) {
        if (typeof value !== 'string') {
            return [invalidValue];
        }
        return [createStringValue(value)];
    }
    if (widgetType === uiOptionsTypes_1.BaWidgetType.Number) {
        if (typeof value !== 'number') {
            return [invalidValue];
        }
        // TODO: Format number
        return [createStringValue(value.toString())];
    }
    if (widgetType === uiOptionsTypes_1.BaWidgetType.TimePicker) {
        if (typeof value !== 'string' || !ajvFormats_1.baTimeRegex.test(value)) {
            return [invalidValue];
        }
        return [createStringValue(value)];
    }
    if (widgetType === uiOptionsTypes_1.BaWidgetType.Checkbox) {
        if (typeof value !== 'boolean') {
            return [invalidValue];
        }
        const checkboxUiOptions = uiOptions;
        return value ? [createStringValue(checkboxUiOptions.checkboxLabel)] : [noneValue];
    }
    if (widgetType === uiOptionsTypes_1.BaWidgetType.FileUpload) {
        if ((0, ajvFormats_1.validateBaFileUuid)(value)) {
            return [createFileValue(value)];
        }
        return [invalidValue];
    }
    if (widgetType === uiOptionsTypes_1.BaWidgetType.FileUploadMultiple) {
        if (!Array.isArray(value)) {
            return [invalidValue];
        }
        if (value.length === 0) {
            return [noneValue];
        }
        return value.map((item) => {
            if (!(0, ajvFormats_1.validateBaFileUuid)(item)) {
                return invalidValue;
            }
            return createFileValue(item);
        });
    }
    if (widgetType === uiOptionsTypes_1.BaWidgetType.DatePicker) {
        try {
            const parsed = (0, date_1.parseDate)(value);
            // TODO: Use shared date formatter
            const formatted = dateFormatter.format(parsed.toDate(bratislavaTimeZone));
            return [createStringValue(formatted)];
        }
        catch (error) {
            return [invalidValue];
        }
    }
    else {
        throw new Error(`Unsupported widget type: ${widgetType}`);
    }
};
exports.getSummaryDisplayValues = getSummaryDisplayValues;
