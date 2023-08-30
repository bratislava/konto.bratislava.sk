import { formsApi } from '@clients/forms'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { createContext, PropsWithChildren, useContext } from 'react'

import { ROUTES } from '../../frontend/api/constants'
import useSnackbar from '../../frontend/hooks/useSnackbar'
import { useFormLeaveProtection } from './useFormLeaveProtection'
import { useFormState } from './useFormState'


const useGetContext = () => {
  const router = useRouter()
  const { formId, formData } = useFormState()
  const { t } = useTranslation('forms')
  const [openSnackbarInfo, closeSnackbarInfo] = useSnackbar({ variant: 'info' })
  const [openSnackbarError] = useSnackbar({ variant: 'error' })
  const { turnOffLeaveProtection } = useFormLeaveProtection()

  const { mutate: saveConceptMutate } = useMutation(
    () =>
      formsApi.nasesControllerUpdateForm(
        formId,
        {
          formDataJson: formData,
        },
        { accessToken: 'onlyAuthenticated' },
      ),
    {
      networkMode: 'always',
      onSuccess: () => {
        closeSnackbarInfo()
      },
      onMutate: () => {
        // TODO: Wording.
        openSnackbarInfo('Ukladám koncept a presmerovávam.')
        turnOffLeaveProtection()
      },
      onError: () => {
        // Maybe different wording for this case.
        openSnackbarError(t('Nepodarilo sa uložiť koncept a presmerovať.'))
      },
    },
  )

  const register = () => {
    saveConceptMutate(undefined, {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onSuccess: async () => {
        // TODO Get back to the same URL after registration.
        await router.push(ROUTES.REGISTER)
      },
    })
  }

  const login = () => {
    saveConceptMutate(undefined, {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onSuccess: async () => {
      // TODO Get back to the same URL after login.
        await router.push(ROUTES.LOGIN)
      },
    })
  }

  const verifyIdentity = () => {
    saveConceptMutate(undefined, {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onSuccess: async () => {
      // TODO Get back to the same URL after verify.
        await router.push(ROUTES.IDENTITY_VERIFICATION)
      },
    })
  }

  return { register, login, verifyIdentity }
}

const FormRedirectsContext = createContext<ReturnType<typeof useGetContext> | undefined>(undefined)

export const FormRedirectsProvider = ({
  children
}: PropsWithChildren) => {
  const context = useGetContext()

  return <FormRedirectsContext.Provider value={context}>{children}</FormRedirectsContext.Provider>
}

export const useFormRedirects = () => {
  const context = useContext(FormRedirectsContext)
  if (!context) {
    throw new Error('useFormRedirects must be used within a FormRedirectsProvider')
  }

  return context
}
