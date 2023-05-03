import { RJSFSchema } from '@rjsf/utils'
import { ErrorObject } from 'ajv'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'

import { submitEform } from '../api/api'
import { ApiError } from '../dtos/generalApiDto'
import logger from '../utils/logger'

export const useFormSubmitter = (slug: string) => {
  const [errors, setErrors] = useState<Array<ErrorObject | string>>([])
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const { t } = useTranslation('forms')

  const submitForm = async (formData: RJSFSchema) => {
    try {
      // TODO do something more with the result then just showing success
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const result = await submitEform(slug, formData)
      setErrors([])
      setSuccessMessage(t('success'))
    } catch (error) {
      logger.error(error)
      if (error instanceof ApiError) {
        setErrors(error.errors)
        logger.warn('Form api errors', error.errors)
      } else if (error instanceof Error) {
        logger.warn('Form non-api errors', error?.message)
        setErrors([t([`errors.${error?.message}`, 'errors.unknown'])])
      } else {
        logger.error('Form unknown error', error)
        setErrors([t('errors.unknown')])
      }
    }
  }

  return {
    submitForm,
    errors,
    successMessage,
  }
}
