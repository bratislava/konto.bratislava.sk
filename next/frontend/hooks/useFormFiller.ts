import { formsApi } from '@clients/forms'
import { useTranslation } from 'next-i18next'

import { InitialFormData } from '../../components/forms/useFormDataLoader'
import useAccount from './useAccount'
import useSnackbar from './useSnackbar'

export interface FormFiller {
  updateFormData: (formData: any) => Promise<void>
}

export const useFormFiller = ({ formId }: InitialFormData): FormFiller => {
  const { getAccessToken } = useAccount()
  const [openSnackbarWarning] = useSnackbar({ variant: 'warning' })
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

  return {
    updateFormData,
  }
}
