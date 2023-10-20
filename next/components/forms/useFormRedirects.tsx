import { formsApi } from '@clients/forms'
import { useMutation } from '@tanstack/react-query'
import useLoginRegisterRedirect from 'frontend/hooks/useLoginRegisterRedirect'
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
  const { setRedirectReturnRoute } = useLoginRegisterRedirect()

  const { mutate: saveConceptMutate } = useMutation({
    mutationFn: () =>
      formsApi.nasesControllerUpdateForm(
        formId,
        {
          formDataJson: formData,
        },
        { accessToken: 'onlyAuthenticated' },
      ),
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
  })

  const register = () => {
    saveConceptMutate(undefined, {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onSuccess: async () => {
        setRedirectReturnRoute(true)
        await router.push(ROUTES.REGISTER)
      },
    })
  }

  const login = () => {
    saveConceptMutate(undefined, {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onSuccess: async () => {
        setRedirectReturnRoute(true)
        await router.push(ROUTES.LOGIN)
      },
    })
  }

  const verifyIdentity = () => {
    saveConceptMutate(undefined, {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onSuccess: async () => {
        setRedirectReturnRoute(true)
        await router.push(ROUTES.IDENTITY_VERIFICATION)
      },
    })
  }

  return { register, login, verifyIdentity }
}

const FormRedirectsContext = createContext<ReturnType<typeof useGetContext> | undefined>(undefined)

export const FormRedirectsProvider = ({ children }: PropsWithChildren) => {
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

// used for when we want different behaviour when we're on forms section
export const useConditionalFormRedirects = () => {
  return useContext(FormRedirectsContext)
}
