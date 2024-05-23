import { DoneCallback, Job } from 'bull'

import generateTaxPdf, {
  GenerateTaxPdfPayload,
} from '../utils/tax/tax-pdf-mapping/generateTaxPdf'

export default async function processor(
  job: Job<GenerateTaxPdfPayload>,
  cb: DoneCallback,
): Promise<void> {
  const result = await generateTaxPdf(job.data)
  // No need to pass error, as if it occurs it will be automatically handled by bull
  cb(null, result)
}
