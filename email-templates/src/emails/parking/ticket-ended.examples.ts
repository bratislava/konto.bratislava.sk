import { defineExamples } from '../../render/examples'
import { parkingTicketEndedEmail } from './ticket-ended'

export default defineExamples({
  product: 'parking',
  id: 'ticket-ended',
  email: parkingTicketEndedEmail,
  examples: {
    default: {
      parkingZone: 'SM1 – Staré Mesto',
      vehiclePlateNumber: 'BA123XY',
      parkingEnd: new Date('2026-01-15T10:30:00+01:00'),
    },
  },
})
