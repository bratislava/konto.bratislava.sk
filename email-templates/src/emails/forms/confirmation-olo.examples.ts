import { defineExamples } from '../../render/examples'
import { formsConfirmationOloEmail } from './confirmation-olo'

export default defineExamples({
  product: 'forms',
  id: 'confirmation-olo',
  email: formsConfirmationOloEmail,
  examples: {
    default: {
      firstName: 'Jana',
      applicationName: 'Odvoz objemného odpadu valníkom',
      requestNoun: 'poziadavka',
      feedbackUrl: null,
    },
  },
})
