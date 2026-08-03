import { RJSFValidationError } from '@rjsf/utils'
import { baAjvFormats } from 'forms-shared/form-utils/ajvFormats'
import { useTranslation } from 'next-i18next/pages'

/**
 * Formats used by our schemas - the custom `ba-` ones and the Ajv built-in formats used by the
 * generator (`email` for input fields, `date` for the date picker).
 */
type TranslatedFormat = keyof typeof baAjvFormats | 'email' | 'date'

/**
 * Ajv error names we provide a translation for, other names fall back to the unknown error message.
 */
type TranslatedErrorName = 'minItems' | 'minLength' | 'pattern' | 'required'

const getErrorFormat = (error: RJSFValidationError) => {
  const params = error.params as { format?: string } | undefined

  return params?.format
}

/**
 * Providing translations through the `transformErrors` RJSFForm prop is the RJSF-recommended way at
 * the time of writing - https://rjsf-team.github.io/react-jsonschema-form/docs/usage/validation#custom-error-messages
 *
 * Errors are matched by the Ajv error name, `format` errors also by the format itself. All keys are
 * written in full and wrapped in `t()` so they can be statically extracted by i18next-cli.
 *
 * TODO can be much better - i.e. many errors contain a "limit" param which can be provided to guide user in case of length requirements.
 * The above scope seems enough for our current use case, but if we need more (i.e. special error based on the name of the field), it should all be self-contained within this function
 */
export const useFormErrorTranslations = () => {
  const { t } = useTranslation('rjsf-errors')

  const formatMessages: Record<TranslatedFormat, string> = {
    email: t('format.email'),
    date: t('format.date'),
    'ba-iban': t('format.ba-iban'),
    'ba-ico': t('format.ba-ico'),
    'ba-phone-number': t('format.ba-phone-number'),
    'ba-slovak-phone-number': t('format.ba-slovak-phone-number'),
    'ba-slovak-zip': t('format.ba-slovak-zip'),
    'ba-ratio': t('format.ba-ratio'),
    'ba-time': t('format.ba-time'),
    'ba-file-uuid': t('format.ba-file-uuid'),
  }

  const errorNameMessages: Record<TranslatedErrorName, string> = {
    minItems: t('minItems'),
    minLength: t('minLength'),
    pattern: t('pattern'),
    required: t('required'),
  }

  const unknownFormatMessage = t('format.unknown')
  const unknownErrorMessage = t('unknown')

  const getMessage = (error: RJSFValidationError) => {
    if (error.name === 'format') {
      const format = getErrorFormat(error)

      return format && format in formatMessages
        ? formatMessages[format as TranslatedFormat]
        : unknownFormatMessage
    }

    return error.name && error.name in errorNameMessages
      ? errorNameMessages[error.name as TranslatedErrorName]
      : unknownErrorMessage
  }

  const transformErrors = (errors: Array<RJSFValidationError>) =>
    errors.map((error) => ({ ...error, message: getMessage(error) }))

  return { transformErrors }
}
