import { defineExamples } from '../../render/examples'
import { kupaliskaSetPasswordEmail } from './set-password'

export default defineExamples({
  product: 'kupaliska',
  id: 'set-password',
  email: kupaliskaSetPasswordEmail,
  examples: {
    default: { setPasswordUrl: 'https://kupaliska.bratislava.sk/nastavenie-hesla?token=example' },
  },
})
