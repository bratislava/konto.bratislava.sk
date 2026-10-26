import { defineExamples } from '../../render/examples'
import type { FormSummarySectionProps } from '../../form-summary/FormSummarySection'
import oloKoloTaxi from './fixtures/olo-kolo-taxi.json' with { type: 'json' }
import { formsNewSubmissionOloEmail } from './new-submission-olo'

export default defineExamples({
  product: 'forms',
  id: 'new-submission-olo',
  email: formsNewSubmissionOloEmail,
  examples: {
    default: {
      ...(oloKoloTaxi as unknown as FormSummarySectionProps),
      subject: 'OLO: Nové podanie',
      applicationName: 'KOLO Taxi',
      formId: '3f2b6d1e-9c4a-4f0e-8b7d-2a1c5e6f7a8b',
      sentAt: new Date('2026-01-15T10:30:00+01:00'),
    },
  },
})
