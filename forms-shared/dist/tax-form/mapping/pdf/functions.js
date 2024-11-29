"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatRodneCisloSecondPartPdf = exports.formatRodneCisloFirstPartPdf = exports.formatIntegerPdf = exports.formatDecimalPdf = exports.generateCopies = exports.mergeObjects = void 0;
const lodash_1 = require("lodash");
function mergeObjects(array) {
    return array.reduce((acc, object) => ({ ...acc, ...object }), {});
}
exports.mergeObjects = mergeObjects;
/**
 * For each element in the array, the mapping function is called to create an object. If there are multiple elements
 * (these are duplicated PDF pages), the keys for properties beyond the first one are modified to include a copy index
 * (e.g., `key_Copy1`, `key_Copy2`, etc.).
 *
 * @example
 * // Example usage:
 * const result = generateCopies(
 *   [{ value: 'first' }, { value: "second" }, { value: 'third'} ],
 *   (element, index) => ({ ['1_Key']: element.value })
 * );
 *
 * // Expected output:
 * // {
 * //   '1_Key': 'first',
 * //   '1_Key_Copy1': 'second',
 * //   '1_Key_Copy2': 'third'
 * // }
 */
function generateCopies(array, fn) {
    const mappedArray = array
        .map((element, index) => fn(element, index))
        .map((object, index) => {
        if (index === 0) {
            return object;
        }
        return (0, lodash_1.mapKeys)(object, (value, key) => `${key}_Copy${index}`);
    });
    return mergeObjects(mappedArray);
}
exports.generateCopies = generateCopies;
function formatDecimalPdf(decimal, forceDecimals = false) {
    if (decimal == null) {
        return;
    }
    return decimal.toLocaleString('sk-SK', {
        minimumFractionDigits: forceDecimals ? 2 : 0,
        maximumFractionDigits: 2,
        useGrouping: false,
    });
}
exports.formatDecimalPdf = formatDecimalPdf;
function formatIntegerPdf(integer) {
    if (integer == null) {
        return;
    }
    return integer.toLocaleString('sk-SK', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        useGrouping: false,
    });
}
exports.formatIntegerPdf = formatIntegerPdf;
function formatRodneCisloFirstPartPdf(parsedRodneCislo) {
    if (!parsedRodneCislo?.isValid) {
        return;
    }
    return parsedRodneCislo.firstPart;
}
exports.formatRodneCisloFirstPartPdf = formatRodneCisloFirstPartPdf;
function formatRodneCisloSecondPartPdf(parsedRodneCislo) {
    if (!parsedRodneCislo?.isValid) {
        return;
    }
    return parsedRodneCislo.secondPart;
}
exports.formatRodneCisloSecondPartPdf = formatRodneCisloSecondPartPdf;
