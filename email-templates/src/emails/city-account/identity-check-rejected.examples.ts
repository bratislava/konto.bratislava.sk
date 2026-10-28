import { defineExamples } from '../../render/examples'
import { cityAccountIdentityCheckRejectedEmail } from './identity-check-rejected'

export default defineExamples({
  product: 'city-account',
  id: 'identity-check-rejected',
  email: cityAccountIdentityCheckRejectedEmail,
  examples: {
    default: {
      firstName: 'Jana',
      verificationUrl: 'https://konto.bratislava.sk/overenie-identity',
    },
  },
})
