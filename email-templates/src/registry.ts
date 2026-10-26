import layoutShowcase, {
  staffLayoutShowcaseExamples,
} from './emails/_internal/layout-showcase.examples'
import emailVerification from './emails/city-account/email-verification.examples'
import identityCheckRejected from './emails/city-account/identity-check-rejected.examples'
import identityCheckSuccessful from './emails/city-account/identity-check-successful.examples'
import passwordChanged from './emails/city-account/password-changed.examples'
import registrationSuccessful from './emails/city-account/registration-successful.examples'
import taxDeliveryMethodChanged from './emails/city-account/tax-delivery-method-changed.examples'
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
]
