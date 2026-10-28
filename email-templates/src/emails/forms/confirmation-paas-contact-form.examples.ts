import { defineExamples } from '../../render/examples'
import { formsConfirmationPaasContactFormEmail } from './confirmation-paas-contact-form'

export default defineExamples({
  product: 'forms',
  id: 'confirmation-paas-contact-form',
  email: formsConfirmationPaasContactFormEmail,
  examples: {
    default: {
      firstName: 'Jana',
      applicationName: 'Kontaktný formulár PAAS',
      requestNoun: 'poziadavka',
      feedbackUrl: null,
    },
  },
})
