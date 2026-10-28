import { defineExamples } from '../../render/examples'
import { cityAccountIdentityCheckSuccessfulEmail } from './identity-check-successful'

export default defineExamples({
  product: 'city-account',
  id: 'identity-check-successful',
  email: cityAccountIdentityCheckSuccessfulEmail,
  examples: {
    default: { firstName: 'Jana' },
    'without-first-name': { firstName: null },
  },
})
