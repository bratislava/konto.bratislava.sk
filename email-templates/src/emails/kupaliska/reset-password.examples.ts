import { defineExamples } from '../../render/examples'
import { kupaliskaResetPasswordEmail } from './reset-password'

export default defineExamples({
  product: 'kupaliska',
  id: 'reset-password',
  email: kupaliskaResetPasswordEmail,
  examples: {
    default: { resetPasswordUrl: 'https://kupaliska.bratislava.sk/reset-hesla?token=example' },
  },
})
