import { defineExamples } from '../../render/examples'
import { cityAccountEmailVerificationEmail } from './email-verification'

export default defineExamples({
  product: 'city-account',
  id: 'email-verification',
  email: cityAccountEmailVerificationEmail,
  examples: {
    default: { verificationCode: '482913' },
  },
})
