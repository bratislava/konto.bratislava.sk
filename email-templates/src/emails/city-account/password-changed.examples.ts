import { defineExamples } from '../../render/examples'
import { cityAccountPasswordChangedEmail } from './password-changed'

export default defineExamples({
  product: 'city-account',
  id: 'password-changed',
  email: cityAccountPasswordChangedEmail,
  examples: {
    default: { firstName: 'Jana' },
    'without-first-name': { firstName: null },
  },
})
