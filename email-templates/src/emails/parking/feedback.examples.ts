import { defineExamples } from '../../render/examples'
import { parkingFeedbackEmail } from './feedback'

export default defineExamples({
  product: 'parking',
  id: 'feedback',
  email: parkingFeedbackEmail,
  examples: {
    default: {
      subject: 'PAAS: Spätná väzba z aplikácie',
      userEmail: 'jana.novakova@example.com',
      userId: '7d1c3b9e-4f2a-4c8b-9e6d-1a2b3c4d5e6f',
      appVersion: '2.14.0 (iOS)',
      feedbackType: 'Nápad na zlepšenie',
      feedbackValue: 'Bolo by fajn vidieť históriu parkovania za celý rok.\nĎakujem!',
    },
  },
})
