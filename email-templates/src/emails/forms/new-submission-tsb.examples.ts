import { defineExamples } from '../../render/examples'
import type { FormSummarySectionProps } from '../../form-summary/FormSummarySection'
import zavazneStanoviskoKInvesticnejCinnosti from './fixtures/zavazne-stanovisko-k-investicnej-cinnosti.json' with { type: 'json' }
import { formsNewSubmissionTsbEmail } from './new-submission-tsb'

export default defineExamples({
  product: 'forms',
  id: 'new-submission-tsb',
  email: formsNewSubmissionTsbEmail,
  examples: {
    default: {
      ...(zavazneStanoviskoKInvesticnejCinnosti as unknown as FormSummarySectionProps),
      subject: 'TSB: Nové podanie [3f2b6d1e]',
      applicationName: 'Objednávka informatívneho zákresu sietí',
      formId: '3f2b6d1e-9c4a-4f0e-8b7d-2a1c5e6f7a8b',
      sentAt: new Date('2026-01-15T10:30:00+01:00'),
    },
  },
})
