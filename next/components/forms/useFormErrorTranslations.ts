import { RJSFValidationError } from '@rjsf/utils'
import { useTranslation } from 'next-i18next'

const errorNameParamMap = {
  format: 'format',
  rodneCisloOrBirthDate: 'reason',
}

const useGetTranslationKey = () => {
  const { t } = useTranslation('rjsf-errors')

  // TODO: workaround, i18n.exists doesn't work, examine
  const exists = (key: string) => t(key) !== key && typeof t(key) === 'string'

  const getErrorParamKey = ({ name, params }: RJSFValidationError) => {
    if (!name) {
      return 'unknown'
    }
    const paramName = errorNameParamMap[name]
    if (!paramName) {
      return `${name}.unknown`
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const paramValue = params?.[paramName]
    if (!paramValue) {
      return `${name}.unknown`
    }
    return `${name}.${paramValue}`
  }

  return (error: RJSFValidationError) => {
    const errorParamKey = getErrorParamKey(error)
    if (exists(errorParamKey)) {
      return errorParamKey
    }
    if (error.name && exists(error.name)) {
      return error.name
    }
    return 'unknown'
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
