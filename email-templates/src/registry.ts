import layoutShowcase, {
  staffLayoutShowcaseExamples,
} from './emails/_internal/layout-showcase.examples'
import emailVerification from './emails/city-account/email-verification.examples'
import registrationSuccessful from './emails/city-account/registration-successful.examples'
import type { RegisteredEmail } from './render/examples'

/**
 * Every email with its examples: the tests snapshot each example, and the preview shows them. A test
 * fails when an email file under `src/emails/` is missing here.
 */
export const registry: RegisteredEmail[] = [
  layoutShowcase,
  staffLayoutShowcaseExamples,
  registrationSuccessful,
  emailVerification,
]
