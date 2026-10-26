/**
 * Emails about forms, sent by nest-forms-backend. They import forms-shared (an optional peer
 * dependency) for the form summaries.
 */
export {
  type FormsApplicationStatusDeliveredEmailProps,
  renderFormsApplicationStatusDeliveredEmail,
} from './emails/forms/application-status-delivered'
export {
  type FormsApplicationStatusDeniedEmailProps,
  renderFormsApplicationStatusDeniedEmail,
} from './emails/forms/application-status-denied'
export {
  type FormsApplicationStatusErrorNotSpecifiedEmailProps,
  renderFormsApplicationStatusErrorNotSpecifiedEmail,
} from './emails/forms/application-status-error-not-specified'
export {
  type FormsApplicationStatusErrorTryAgainEmailProps,
  renderFormsApplicationStatusErrorTryAgainEmail,
} from './emails/forms/application-status-error-try-again'
export {
  type FormsApplicationStatusInProgressEmailProps,
  renderFormsApplicationStatusInProgressEmail,
} from './emails/forms/application-status-in-progress'
export {
  type FormsApplicationStatusSentEmailProps,
  renderFormsApplicationStatusSentEmail,
} from './emails/forms/application-status-sent'
export {
  type FormsApplicationStatusSuccessEmailProps,
  renderFormsApplicationStatusSuccessEmail,
} from './emails/forms/application-status-success'
export {
  type FormsApplicationStatusVirusEmailProps,
  renderFormsApplicationStatusVirusEmail,
} from './emails/forms/application-status-virus'
export {
  type FormsConfirmationBratislavaEmailProps,
  renderFormsConfirmationBratislavaEmail,
} from './emails/forms/confirmation-bratislava'
export {
  type FormsConfirmationOloEmailProps,
  renderFormsConfirmationOloEmail,
} from './emails/forms/confirmation-olo'
export {
  type FormsConfirmationPaasContactFormEmailProps,
  renderFormsConfirmationPaasContactFormEmail,
} from './emails/forms/confirmation-paas-contact-form'
export {
  type FormsConfirmationTsbEmailProps,
  renderFormsConfirmationTsbEmail,
} from './emails/forms/confirmation-tsb'
export {
  type FormsNewSubmissionBratislavaEmailProps,
  renderFormsNewSubmissionBratislavaEmail,
} from './emails/forms/new-submission-bratislava'
export {
  type FormsNewSubmissionOloEmailProps,
  renderFormsNewSubmissionOloEmail,
} from './emails/forms/new-submission-olo'
export {
  type FormsNewSubmissionTsbEmailProps,
  renderFormsNewSubmissionTsbEmail,
} from './emails/forms/new-submission-tsb'
export type { FormConfirmationEmailProps } from './emails/forms/components/FormConfirmation'
export type { NewSubmissionEmailProps } from './emails/forms/components/NewSubmission'
export type { RequestNoun } from './i18n/request-noun'
