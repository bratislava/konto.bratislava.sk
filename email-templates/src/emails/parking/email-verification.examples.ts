import { defineExamples } from '../../render/examples'
import { parkingEmailVerificationEmail } from './email-verification'

export default defineExamples({
  product: 'parking',
  id: 'email-verification',
  email: parkingEmailVerificationEmail,
  examples: {
    'sk-bonus-cards': {
      locale: 'sk',
      cardType: 'BPK',
      phoneNumber: '+421 905 123 456',
      token: '482913',
    },
    'sk-visitor-cards': {
      locale: 'sk',
      cardType: 'NPK',
      phoneNumber: '+421 905 123 456',
      token: '482913',
    },
    'en-bonus-cards': {
      locale: 'en',
      cardType: 'BPK',
      phoneNumber: '+421 905 123 456',
      token: '482913',
    },
  },
})
