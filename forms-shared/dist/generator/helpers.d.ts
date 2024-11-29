import type { RJSFSchema } from '@rjsf/utils';
import { BaAjvInputFormat } from '../form-utils/ajvFormats';
import { InputUiOptionsInputType } from './uiOptionsTypes';
/**
 * Create a condition object from a list of paths and values.
 *
 * Most of the conditions in JSON Schema are repetitive and require a lot of boilerplate. This
 * function simplifies the process by creating a condition object from a list of paths and values
 * and expecting the whole tree to be required.
 *
 * @example
 * createCondition([
 *  [['a', 'b'], { const: 'value1' }],
 *  [['a', 'c'], { const: 'value2' }],
 *  [['x', 'array:y', 'z'], { const: 'value3' }],
 * ])
 *
 * // Outputs:
 * {
 *   type: 'object',
 *   properties: {
 *     a: {
 *       type: 'object',
 *       properties: {
 *         b: { const: 'value1' },
 *         c: { const: 'value2' },
 *       },
 *       required: ['b', 'c'],
 *     },
 *     x: {
 *       type: 'object',
 *       properties: {
 *         y: {
 *           type: 'array',
 *           items: {
 *             type: 'object',
 *             properties: {
 *               z: { const: 'value3' },
 *             },
 *             required: ['z'],
 *           },
 *         },
 *       },
 *       required: ['y'],
 *     },
 *   },
 *   required: ['a', 'x'],
 * }
 */
export declare const createCondition: (conditions: [string[], RJSFSchema][]) => RJSFSchema;
/**
 * Create items from a list of strings. For example:
 * ['Item 1', 'Item 2'] => [{ value: 'Item 1', label: 'Item 1', isDefault: true }, ...]
 */
export declare const createStringItems: (items: string[], addDefault?: boolean) => {
    value: string;
    label: string;
    isDefault: boolean | undefined;
}[];
/**
 * Create items from a list of objects with labels. For example:
 * [{ label: 'Item 1' }, { label: 'Item 2' }] => [{ value: 'Item 1', label: 'Item 1', isDefault: true }, ...]
 */
export declare const createStringItemsV2: <Item extends {
    label: string;
}>(items: Item[], addDefault?: boolean) => ({
    value: string;
} & Item & {
    isDefault: boolean | undefined;
})[];
/**
 * Create items with camelCase value from a list of strings. For example:
 * ['Item 1', 'Item 2'] => [{ value: 'item1', label: 'Item 1', isDefault: true }, ...]
 */
export declare const createCamelCaseItems: (items: string[], addDefault?: boolean) => {
    value: string;
    label: string;
    isDefault: boolean | undefined;
}[];
/**
 * Create items with camelCase value from a list of objects. For example:
 * [{ label: 'Item 1' }, { label: 'Item 2' }] => [{ value: 'item1', label: 'Item 1', isDefault: true }, ...]
 */
export declare const createCamelCaseItemsV2: <Item extends {
    label: string;
}>(items: Item[], addDefault?: boolean) => ({
    value: string;
} & Item & {
    isDefault: boolean | undefined;
})[];
/**
 * All generated schemas must not have `undefined` values in objects, RJSF relies on checks like `'oneOf' in schema`
 * which returns `true` for `{ oneOf: undefined }`.
 */
export declare const removeUndefinedValues: <T>(obj: T) => T;
export declare const getInputTypeForAjvFormat: (format: BaAjvInputFormat) => InputUiOptionsInputType;
