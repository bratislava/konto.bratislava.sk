import { defineExamples } from '../../render/examples'
import { formsApplicationStatusInProgressEmail } from './application-status-in-progress'

export default defineExamples({
  product: 'forms',
  id: 'application-status-in-progress',
  email: formsApplicationStatusInProgressEmail,
  examples: {
    default: {
      firstName: 'Jana',
      applicationName: 'Záväzné stanovisko k investičnej činnosti',
      frontendUrl: 'https://konto.bratislava.sk',
    },
  },
})
