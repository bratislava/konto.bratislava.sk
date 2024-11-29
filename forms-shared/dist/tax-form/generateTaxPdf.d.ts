import { TaxFormData } from './types';
export type GenerateTaxPdfPayload = {
    formData: TaxFormData;
    formId?: string;
};
/**
 * @returns Base64 encoded PDF
 */
export declare function generateTaxPdf({ formData, formId }: GenerateTaxPdfPayload): Promise<string>;
