import { defineExamples } from '../../render/examples'
import { formsConfirmationTsbEmail } from './confirmation-tsb'

export default defineExamples({
  product: 'forms',
  id: 'confirmation-tsb',
  email: formsConfirmationTsbEmail,
  examples: {
    order: {
      firstName: 'Jana',
      applicationName: 'Objednávka informatívneho zákresu sietí',
      requestNoun: 'objednavka',
      feedbackUrl: 'https://example.com/dotaznik',
    },
    request: {
      firstName: null,
      applicationName: 'Žiadosť o stanovisko k projektovej dokumentácii',
      requestNoun: 'ziadost',
      feedbackUrl: null,
    },
  },
})
