import { JSONSchema7 } from 'json-schema';
import { BaWidgetType } from '../generator/uiOptionsTypes';
import { WidgetProps } from '@rjsf/utils';
export declare enum SummaryDisplayValueType {
    String = "String",
    File = "File",
    Invalid = "Invalid",
    None = "None"
}
export type SummaryDisplayValue = {
    type: SummaryDisplayValueType.String;
    value: string;
} | {
    type: SummaryDisplayValueType.File;
    id: string;
} | {
    type: SummaryDisplayValueType.Invalid;
} | {
    type: SummaryDisplayValueType.None;
};
export type SummaryDisplayValues = SummaryDisplayValue[];
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
export declare const getSummaryDisplayValues: (value: any, widgetType: BaWidgetType, schema: JSONSchema7, uiOptions: WidgetProps['options']) => SummaryDisplayValues;
