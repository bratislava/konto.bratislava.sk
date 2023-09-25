import { RJSFValidationError } from '@rjsf/utils'
import { useTranslation } from 'next-i18next'

// today this is more of an example then necessity
// providing specific errors for different regex patterns will likely be needed, this provides pattern to follow
const getSpecialCaseErrorTranslationKey = (error: RJSFValidationError) => {
  let parameterValue = ''
  // eslint-disable-next-line sonarjs/no-small-switch
  switch (error.name) {
    case 'pattern':
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      parameterValue = error?.params?.pattern || ''
      break
    default:
      parameterValue = ''
  }
  return `specialCaseByNameAndParamValue.${error.name}.${parameterValue}`
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
  const transformErrors = (errors: Array<RJSFValidationError>) =>
    errors.map((error) => {
      return {
        ...error,
        message: t([getSpecialCaseErrorTranslationKey(error), error.name || 'unknown']),
      }
    })
  return { transformErrors }
}
