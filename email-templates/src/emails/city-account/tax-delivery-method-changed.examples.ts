import { defineExamples } from '../../render/examples'
import { cityAccountTaxDeliveryMethodChangedEmail } from './tax-delivery-method-changed'

export default defineExamples({
  product: 'city-account',
  id: 'tax-delivery-method-changed',
  email: cityAccountTaxDeliveryMethodChangedEmail,
  examples: {
    email: { firstName: 'Jana', deliveryMethod: 'email' },
    edesk: { firstName: 'Jana', deliveryMethod: 'edesk' },
    postal: { firstName: 'Jana', deliveryMethod: 'postal' },
    'without-first-name': { firstName: null, deliveryMethod: 'postal' },
  },
})
