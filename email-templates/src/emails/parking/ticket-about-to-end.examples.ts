import { defineExamples } from '../../render/examples'
import { parkingTicketAboutToEndEmail } from './ticket-about-to-end'

export default defineExamples({
  product: 'parking',
  id: 'ticket-about-to-end',
  email: parkingTicketAboutToEndEmail,
  examples: {
    default: { parkingZone: 'SM1 – Staré Mesto', vehiclePlateNumber: 'BA123XY' },
  },
})
