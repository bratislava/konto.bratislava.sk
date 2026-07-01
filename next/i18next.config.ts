import { defineConfig } from 'i18next-cli'
import i18nextConfig from './next-i18next.config'

// Docs: https://github.com/i18next/i18next-cli
export default defineConfig({
  locales: i18nextConfig.i18n.locales,
  extract: {
    input: 'src/**/*.{tsx,ts}',
    output: 'public/locales/{{language}}/{{namespace}}.json',
    sort: true,
    // makes the translation json files flat (our keys contain dots)
    keySeparator: false,
    preservePatterns: [
      // Translations in account forms (registration, login...) are thrown away during parsing. This is quick fix, how to keep them.
      'account:auth.fields.*_format',
      'account:auth.fields.*_required',
      'account:IdentityVerificationStatus.verification_status_required_alert',
      // rjsf-errors keys are referenced dynamically (t(`format.${...}`), t(error.name)) so cannot be statically extracted.
      'rjsf-errors:*',
    ],
  },
})
