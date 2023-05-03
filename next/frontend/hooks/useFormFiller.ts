import { EFormValue } from '@backend/forms'
import { RJSFSchema } from '@rjsf/utils'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'

import { createForm, getForm, updateForm } from '../api/api'
import { FormDto } from '../dtos/formDto'
import useAccount from './useAccount'
import useSnackbar from './useSnackbar'

export const useFormFiller = (eform: EFormValue) => {
  const [formId, setFormId] = useState<string | undefined>()

  const { getAccessToken } = useAccount()
  const [openSnackbarWarning] = useSnackbar({ variant: 'warning' })
  const [openSnackbarError] = useSnackbar({ variant: 'error' })
  const { t } = useTranslation('forms')

  const updateFormData = async (formData: any) => {
    const token = await getAccessToken()
    if (!formId || !token) {
      return
    }

    try {
      await updateForm(token, formId, { formDataJson: formData })
    } catch (error) {
      openSnackbarWarning(t('errors.form_update'))
    }
  }

  const router = useRouter()
  const initFormData = async (): Promise<RJSFSchema> => {
    let formData: RJSFSchema
    const token = await getAccessToken()
    if (!token) {
      return undefined
    }

    const queryId =
      router.query.id && typeof router.query.id === 'string' ? router.query.id : undefined
    try {
      if (queryId) {
        const { formDataJson, id }: FormDto = await getForm(token, queryId)
        setFormId(id)
        formData = formDataJson
      } else {
        const { id }: FormDto = await createForm(token, {
          pospID: eform.schema.pospID,
          pospVersion: eform.schema.pospVersion,
          messageSubject: eform.schema.pospID,
          isSigned: false,
          formName: eform.schema.title || eform.schema.pospID,
          fromDescription: eform.schema.description || eform.schema.pospID,
        })
        setFormId(id)
      }
    } catch (error) {
      openSnackbarError(t('errors.form_init'))
    }
    return formData
  }

  return {
    initFormData,
    updateFormData,
    formId,
  }
}
