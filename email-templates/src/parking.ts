/** Emails of the PAAS parking app, sent by its backend outside this repository. */
export {
  type ParkingCardType,
  type ParkingEmailVerificationEmailProps,
  renderParkingEmailVerificationEmail,
} from './emails/parking/email-verification'
export {
  type ParkingFeedbackEmailProps,
  renderParkingFeedbackEmail,
} from './emails/parking/feedback'
export {
  type ParkingTicketAboutToEndEmailProps,
  renderParkingTicketAboutToEndEmail,
} from './emails/parking/ticket-about-to-end'
export {
  type ParkingTicketEndedEmailProps,
  renderParkingTicketEndedEmail,
} from './emails/parking/ticket-ended'
