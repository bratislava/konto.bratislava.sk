import { ParsedRodneCislo } from '../shared/functions';
import { TaxPdfMapping } from '../../types';
export declare function mergeObjects<T extends object>(array: T[]): T;
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
export declare function generateCopies<T>(array: T[], fn: (element: T, index: number) => TaxPdfMapping): TaxPdfMapping;
export declare function formatDecimalPdf(decimal: number | null | undefined, forceDecimals?: boolean): string | undefined;
export declare function formatIntegerPdf(integer: number | null | undefined): string | undefined;
export declare function formatRodneCisloFirstPartPdf(parsedRodneCislo: ParsedRodneCislo | undefined): string | undefined;
export declare function formatRodneCisloSecondPartPdf(parsedRodneCislo: ParsedRodneCislo | undefined): string | undefined;
