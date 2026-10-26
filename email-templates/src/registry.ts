import layoutShowcase, {
  staffLayoutShowcaseExamples,
} from './emails/_internal/layout-showcase.examples'
import emailVerification from './emails/city-account/email-verification.examples'
import identityCheckRejected from './emails/city-account/identity-check-rejected.examples'
import identityCheckSuccessful from './emails/city-account/identity-check-successful.examples'
import passwordChanged from './emails/city-account/password-changed.examples'
import registrationSuccessful from './emails/city-account/registration-successful.examples'
import taxDeliveryMethodChanged from './emails/city-account/tax-delivery-method-changed.examples'
import formsApplicationStatusDelivered from './emails/forms/application-status-delivered.examples'
import formsApplicationStatusDenied from './emails/forms/application-status-denied.examples'
import formsApplicationStatusErrorNotSpecified from './emails/forms/application-status-error-not-specified.examples'
import formsApplicationStatusErrorTryAgain from './emails/forms/application-status-error-try-again.examples'
import formsApplicationStatusInProgress from './emails/forms/application-status-in-progress.examples'
import formsApplicationStatusSent from './emails/forms/application-status-sent.examples'
import formsApplicationStatusSuccess from './emails/forms/application-status-success.examples'
import formsApplicationStatusVirus from './emails/forms/application-status-virus.examples'
import formsConfirmationBratislava from './emails/forms/confirmation-bratislava.examples'
import formsConfirmationOlo from './emails/forms/confirmation-olo.examples'
import formsConfirmationPaasContactForm from './emails/forms/confirmation-paas-contact-form.examples'
import formsConfirmationTsb from './emails/forms/confirmation-tsb.examples'
import formsNewSubmissionBratislava from './emails/forms/new-submission-bratislava.examples'
import formsNewSubmissionOlo from './emails/forms/new-submission-olo.examples'
import formsNewSubmissionTsb from './emails/forms/new-submission-tsb.examples'
import type { RegisteredEmail } from './render/examples'

/**
 * Every email with its examples: the tests snapshot each example, and the preview shows them. A test
 * fails when an email file under `src/emails/` is missing here.
 */
export const registry: RegisteredEmail[] = [
  layoutShowcase,
  staffLayoutShowcaseExamples,
  // city-account
  registrationSuccessful,
  emailVerification,
  identityCheckSuccessful,
  identityCheckRejected,
  passwordChanged,
  taxDeliveryMethodChanged,
  // forms
  formsApplicationStatusDelivered,
  formsApplicationStatusDenied,
  formsApplicationStatusErrorNotSpecified,
  formsApplicationStatusErrorTryAgain,
  formsApplicationStatusInProgress,
  formsApplicationStatusSent,
  formsApplicationStatusSuccess,
  formsApplicationStatusVirus,
  formsConfirmationBratislava,
  formsConfirmationOlo,
  formsConfirmationPaasContactForm,
  formsConfirmationTsb,
  formsNewSubmissionBratislava,
  formsNewSubmissionOlo,
  formsNewSubmissionTsb,
]
