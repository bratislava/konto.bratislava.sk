import { defineExamples } from '../../render/examples'
import { formsApplicationStatusVirusEmail } from './application-status-virus'

export default defineExamples({
  product: 'forms',
  id: 'application-status-virus',
  email: formsApplicationStatusVirusEmail,
  examples: {
    default: {
      firstName: 'Jana',
      applicationName: 'Záväzné stanovisko k investičnej činnosti',
      frontendUrl: 'https://konto.bratislava.sk',
      editUrl:
        'https://konto.bratislava.sk/zavazne-stanovisko-k-investicnej-cinnosti/5c9f0b4e-0000-4000-8000-000000000000',
    },
  },
})
