import { defineExamples } from '../../render/examples'
import { cityAccountRegistrationSuccessfulEmail } from './registration-successful'

export default defineExamples({
  product: 'city-account',
  id: 'registration-successful',
  email: cityAccountRegistrationSuccessfulEmail,
  examples: {
    default: { firstName: 'Jana' },
    'without-first-name': { firstName: null },
  },
})
