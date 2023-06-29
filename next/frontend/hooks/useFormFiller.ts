import { EFormValue } from '@backend/forms'
import { RJSFSchema } from '@rjsf/utils'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'

import { createForm, getForm, updateForm } from '../api/api'
import { FormDto } from '../dtos/formDto'
import useSnackbar from './useSnackbar'

export interface FormFiller {
  initFormData: () => Promise<RJSFSchema | undefined | null>
  updateFormData: (formData: any) => Promise<void>
  formId?: string
  formUserExternalId?: string
}

export const useFormFiller = (eform: EFormValue): FormFiller => {
  const [formId, setFormId] = useState<string | undefined>()
  const [formUserExternalId, setFormUserExternalId] = useState<string | undefined>()

  const [openSnackbarWarning] = useSnackbar({ variant: 'warning' })
  const [openSnackbarError] = useSnackbar({ variant: 'error' })
  const { t } = useTranslation('forms')

  const updateFormData = async (formData: any) => {
    if (!formId) {
      return
    }

    try {
      await updateForm(formId, { formDataJson: formData })
    } catch (error) {
      openSnackbarWarning(t('errors.form_update'))
    }
  }

  const router = useRouter()
  const initFormData = async (): Promise<RJSFSchema | undefined | null> => {
    let formData: RJSFSchema | null = null

    const queryId =
      router.query.id && typeof router.query.id === 'string' ? router.query.id : undefined
    try {
      if (queryId) {
        const { formDataJson, id, userExternalId }: FormDto = await getForm(queryId)
        setFormId(id)
        setFormUserExternalId(userExternalId)
        formData = formDataJson
      } else {
        const { id, userExternalId }: FormDto = await createForm({
          pospID: eform.schema.pospID,
          pospVersion: eform.schema.pospVersion,
          messageSubject: eform.schema.pospID,
          isSigned: false,
          formName: eform.schema.title || eform.schema.pospID,
          fromDescription: eform.schema.description || eform.schema.pospID,
        })
        setFormId(id)
        setFormUserExternalId(userExternalId)
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
    formUserExternalId,
  }
}
