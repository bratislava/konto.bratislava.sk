import { defineExamples } from '../../render/examples'
import { formsApplicationStatusDeniedEmail } from './application-status-denied'

export default defineExamples({
  product: 'forms',
  id: 'application-status-denied',
  email: formsApplicationStatusDeniedEmail,
  examples: {
    default: {
      firstName: 'Jana',
      applicationName: 'Záväzné stanovisko k investičnej činnosti',
      frontendUrl: 'https://konto.bratislava.sk',
      feedbackUrl: 'https://example.com/dotaznik',
    },
    'without-feedback-and-first-name': {
      firstName: null,
      applicationName: 'Záväzné stanovisko k investičnej činnosti',
      frontendUrl: 'https://konto.bratislava.sk',
      feedbackUrl: null,
    },
  },
})
