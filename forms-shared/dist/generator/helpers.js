"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInputTypeForAjvFormat = exports.removeUndefinedValues = exports.createCamelCaseItemsV2 = exports.createCamelCaseItems = exports.createStringItemsV2 = exports.createStringItems = exports.createCondition = void 0;
const camelCase_1 = __importDefault(require("lodash/camelCase"));
const arrayPrefix = 'array:';
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
const createCondition = (conditions) => {
    const result = {
        type: 'object',
        properties: {},
        required: [],
    };
    const ownObjects = [result];
    conditions.forEach(([path, value]) => {
        let currentLevel = result;
        path.forEach((keyWithPrefix, index) => {
            if (!ownObjects.includes(currentLevel)) {
                // This function expects a strict schema to be followed, so if previous path is created by user, it's an error
                // to try to write to it.
                throw new Error(`Condition path cannot be written to user created object at "${path
                    .slice(0, index)
                    .join('.')}"`);
            }
            const isArrayKey = keyWithPrefix.startsWith(arrayPrefix);
            const key = isArrayKey ? keyWithPrefix.slice(arrayPrefix.length) : keyWithPrefix;
            if (index === path.length - 1) {
                if (!currentLevel.required.includes(key)) {
                    currentLevel.required.push(key);
                }
                currentLevel.properties[key] = value;
                return;
            }
            if (!currentLevel.properties[key]) {
                const newObject = {
                    type: 'object',
                    properties: {},
                    required: [],
                };
                ownObjects.push(newObject);
                currentLevel.properties[key] = isArrayKey
                    ? { type: 'array', items: newObject }
                    : newObject;
                currentLevel.required.push(key);
            }
            const nextLevel = currentLevel.properties[key];
            if (isArrayKey) {
                if (nextLevel.type !== 'array') {
                    throw new Error(`A non-array path already exists at "${path.slice(0, index + 1).join('.')}"`);
                }
                currentLevel = nextLevel.items;
            }
            else {
                if (nextLevel.type !== 'object') {
                    throw new Error(`A non-object path already exists at "${path.slice(0, index + 1).join('.')}"`);
                }
                currentLevel = nextLevel;
            }
        });
    });
    return result;
};
exports.createCondition = createCondition;
const assertUniqueItems = (items) => {
    const uniqueValues = new Set(items.map((item) => item.value));
    if (uniqueValues.size !== items.length) {
        throw new Error('Items must have unique values');
    }
};
/**
 * Create items from a list of strings. For example:
 * ['Item 1', 'Item 2'] => [{ value: 'Item 1', label: 'Item 1', isDefault: true }, ...]
 */
const createStringItems = (items, addDefault = true) => {
    const result = items.map((item, index) => ({
        value: item,
        label: item,
        isDefault: index === 0 && addDefault ? true : undefined,
    }));
    assertUniqueItems(result);
    return result;
};
exports.createStringItems = createStringItems;
/**
 * Create items from a list of objects with labels. For example:
 * [{ label: 'Item 1' }, { label: 'Item 2' }] => [{ value: 'Item 1', label: 'Item 1', isDefault: true }, ...]
 */
const createStringItemsV2 = (items, addDefault = true) => {
    const result = items.map((item, index) => ({
        value: item.label,
        ...item,
        isDefault: index === 0 && addDefault ? true : undefined,
    }));
    assertUniqueItems(result);
    return result;
};
exports.createStringItemsV2 = createStringItemsV2;
/**
 * Create items with camelCase value from a list of strings. For example:
 * ['Item 1', 'Item 2'] => [{ value: 'item1', label: 'Item 1', isDefault: true }, ...]
 */
const createCamelCaseItems = (items, addDefault = true) => {
    const result = items.map((item, index) => ({
        value: (0, camelCase_1.default)(item),
        label: item,
        isDefault: index === 0 && addDefault ? true : undefined,
    }));
    assertUniqueItems(result);
    return result;
};
exports.createCamelCaseItems = createCamelCaseItems;
/**
 * Create items with camelCase value from a list of objects. For example:
 * [{ label: 'Item 1' }, { label: 'Item 2' }] => [{ value: 'item1', label: 'Item 1', isDefault: true }, ...]
 */
const createCamelCaseItemsV2 = (items, addDefault = true) => {
    const result = items.map((item, index) => ({
        value: (0, camelCase_1.default)(item.label),
        ...item,
        isDefault: index === 0 && addDefault ? true : undefined,
    }));
    assertUniqueItems(result);
    return result;
};
exports.createCamelCaseItemsV2 = createCamelCaseItemsV2;
/**
 * All generated schemas must not have `undefined` values in objects, RJSF relies on checks like `'oneOf' in schema`
 * which returns `true` for `{ oneOf: undefined }`.
 */
const removeUndefinedValues = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};
exports.removeUndefinedValues = removeUndefinedValues;
const getInputTypeForAjvFormat = (format) => {
    return {
        'ba-slovak-zip': 'text',
        'ba-phone-number': 'tel',
        'ba-slovak-phone-number': 'tel',
        'ba-ico': 'text',
        'ba-iban': 'text',
        'ba-ratio': 'text',
    }[format];
};
exports.getInputTypeForAjvFormat = getInputTypeForAjvFormat;
