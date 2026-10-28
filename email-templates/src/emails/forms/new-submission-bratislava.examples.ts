import { defineExamples } from '../../render/examples'
import type { FormSummarySectionProps } from '../../form-summary/FormSummarySection'
import nahlaseniePodnetuKElektrickymKolobezkam from './fixtures/nahlasenie-podnetu-k-elektrickym-kolobezkam.json' with { type: 'json' }
import { formsNewSubmissionBratislavaEmail } from './new-submission-bratislava'

export default defineExamples({
  product: 'forms',
  id: 'new-submission-bratislava',
  email: formsNewSubmissionBratislavaEmail,
  examples: {
    default: {
      ...(nahlaseniePodnetuKElektrickymKolobezkam as unknown as FormSummarySectionProps),
      subject: 'Bratislavské konto: Nové podanie',
      applicationName: 'Nahlásenie podnetu k elektrickým kolobežkám',
      formId: '3f2b6d1e-9c4a-4f0e-8b7d-2a1c5e6f7a8b',
      sentAt: new Date('2026-01-15T10:30:00+01:00'),
    },
  },
})
