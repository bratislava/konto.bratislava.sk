import { defineExamples } from '../../render/examples'
import { exampleFixturesBaseUrl } from '../../render/examples'
import { kupaliskaPurchasedTicketsEmail } from './purchased-tickets'

export default defineExamples({
  product: 'kupaliska',
  id: 'purchased-tickets',
  email: kupaliskaPurchasedTicketsEmail,
  examples: {
    default: {
      firstName: 'Jana',
      tickets: [
        {
          heading: 'Sezónna permanentka – dospelý',
          subheading: 'Jana Nováková',
          qrCodeUrl: `${exampleFixturesBaseUrl}/qr-code.png`,
          backgroundColor: '#07038C',
          textColor: '#FFFFFF',
          appleWalletUrl: 'https://kupaliska.bratislava.sk/wallet/apple/example',
          googleWalletUrl: 'https://kupaliska.bratislava.sk/wallet/google/example',
        },
        {
          heading: 'Sezónna permanentka – dieťa',
          subheading: 'Dana Nováková, 5 rokov',
          qrCodeUrl: `${exampleFixturesBaseUrl}/qr-code.png`,
          backgroundColor: '#7CCEF2',
          textColor: '#07038C',
          appleWalletUrl: null,
          googleWalletUrl: null,
        },
      ],
      purchase: {
        items: [
          { name: 'Sezónna permanentka – dospelý', quantity: 1, price: 99 },
          { name: 'Sezónna permanentka – dieťa', quantity: 1, price: 1 },
        ],
        total: 100,
      },
    },
  },
})
