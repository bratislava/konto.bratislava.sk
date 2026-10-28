import { defineExamples } from '../../render/examples'
import { formsApplicationStatusErrorNotSpecifiedEmail } from './application-status-error-not-specified'

export default defineExamples({
  product: 'forms',
  id: 'application-status-error-not-specified',
  email: formsApplicationStatusErrorNotSpecifiedEmail,
  examples: {
    default: {
      firstName: 'Jana',
      applicationName: 'Záväzné stanovisko k investičnej činnosti',
      frontendUrl: 'https://konto.bratislava.sk',
    },
  },
})
