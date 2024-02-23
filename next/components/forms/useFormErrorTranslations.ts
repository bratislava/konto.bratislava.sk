import { RJSFValidationError } from '@rjsf/utils'
import { useTranslation } from 'next-i18next'

const useGetTranslationKey = () => {
  const { t } = useTranslation('rjsf-errors')

  // TODO: workaround, i18n.exists doesn't work, examine
  const exists = (key: string) => t(key) !== key

  return (error: RJSFValidationError) => {
    // eslint-disable-next-line sonarjs/no-small-switch
    switch (error.name) {
      case 'format':
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const key = `format.${error?.params?.format}`
        if (exists(key)) {
          return key
        }

        return `format.unknown`
      default:
        return error.name ?? 'unknown'
    }
  }
}

/**
 * Add missing error names to rjsf-errors.json file
 *
 * Providing translations through transformErrors RJSFForm prop is the RJSF-recommended way at the time of writing - https://rjsf-team.github.io/react-jsonschema-form/docs/usage/validation#custom-error-messages
 * This provides way to match by error name (for general cases like required, numberOfItems etc,)
 * as well as matching based on error name and one parameter per error name
 *
 * TODO can be much better - i.e. many errors contain a "limit" param which can be provided to guide user in case of length requirements.
 * The above scope seems enough for our current use case, but if we need more (i.e. special error based on the name of the field), it should all be self-contained within this function
 */
export const useFormErrorTranslations = () => {
  const { t } = useTranslation('rjsf-errors')
  const getTranslationKey = useGetTranslationKey()

  const transformErrors = (errors: Array<RJSFValidationError>) =>
    errors.map((error) => {
      return {
        ...error,
        message: t(getTranslationKey(error)),
      }
    })
  return { transformErrors }
}
