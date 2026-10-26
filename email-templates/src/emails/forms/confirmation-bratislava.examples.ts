import { defineExamples } from '../../render/examples'
import { formsConfirmationBratislavaEmail } from './confirmation-bratislava'

export default defineExamples({
  product: 'forms',
  id: 'confirmation-bratislava',
  email: formsConfirmationBratislavaEmail,
  examples: {
    default: {
      firstName: 'Jana',
      applicationName: 'Nahlásenie podnetu k elektrickým kolobežkám',
      requestNoun: 'ziadost',
      feedbackUrl: 'https://example.com/dotaznik',
    },
  },
})
