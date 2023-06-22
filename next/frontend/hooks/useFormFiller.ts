import { EFormValue } from '@backend/forms'
import { formsApi } from '@clients/forms'
import { RJSFSchema } from '@rjsf/utils'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'

import useAccount from './useAccount'
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
      await formsApi.nasesControllerUpdateForm(
        formId,
        /// TS2345: Argument of type '{ formDataJson: string; }' is not assignable to parameter of type 'UpdateFormRequestDto'.
        // Type '{ formDataXml: string; }' is missing the following properties from type 'UpdateFormRequestDto': 'email', 'formDataXml', 'pospVersion', 'messageSubject
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        {
          formDataJson: formData,
        },
        { accessToken: token },
      )
    } catch (error) {
      openSnackbarWarning(t('errors.form_update'))
    }
  }

  const router = useRouter()
  const initFormData = async (): Promise<RJSFSchema | undefined | null> => {
    let formData: RJSFSchema | null = null
    const token = await getAccessToken()

    if (!token) {
      return undefined
    }

    const queryId =
      router.query.id && typeof router.query.id === 'string' ? router.query.id : undefined
    try {
      if (queryId) {
        const response = await formsApi.nasesControllerGetForm(queryId, {
          accessToken: token,
        })
        setFormId(response.data.id)
        setFormUserExternalId(response.data.userExternalId)
        formData = response.data.formDataJson
      } else {
        const response = await formsApi.nasesControllerCreateForm(
          {
            pospID: eform.schema.pospID,
            pospVersion: eform.schema.pospVersion,
            messageSubject: eform.schema.pospID,
            isSigned: false,
            formName: eform.schema.title || eform.schema.pospID,
            fromDescription: eform.schema.description || eform.schema.pospID,
          },
          { accessToken: token },
        )
        const { id, userExternalId } = response.data

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
