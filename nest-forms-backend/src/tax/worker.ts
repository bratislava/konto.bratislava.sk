import {
  generateTaxPdf,
  GenerateTaxPdfPayload,
} from 'forms-shared/tax-form/generateTaxPdf'

export default async function worker(
  payload: GenerateTaxPdfPayload,
): Promise<string> {
  return generateTaxPdf(payload)
}
