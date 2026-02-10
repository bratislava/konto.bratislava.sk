import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { createContext, PropsWithChildren, useContext } from 'react'

import { formsClient } from '@/clients/forms'
import { useFormSignature } from '@/components/forms/signer/useFormSignature'
import { useFormContext } from '@/components/forms/useFormContext'
import { useFormData } from '@/components/forms/useFormData'
import { useFormLeaveProtection } from '@/components/forms/useFormLeaveProtection'
import { ROUTES } from '@/frontend/api/constants'
import { useQueryParamRedirect } from '@/frontend/hooks/useQueryParamRedirect'
import useSnackbar from '@/frontend/hooks/useSnackbar'

const useGetContext = () => {
  const router = useRouter()
  const { getRouteWithCurrentUrlRedirect } = useQueryParamRedirect()
  const { formId } = useFormContext()
  const { formData } = useFormData()
  const { t } = useTranslation('forms')
  const [openSnackbarInfo, closeSnackbarInfo] = useSnackbar({ variant: 'info' })
  const [openSnackbarError] = useSnackbar({ variant: 'error' })
  const { turnOffLeaveProtection } = useFormLeaveProtection()
  const { signature } = useFormSignature()

  const { mutate: saveConceptMutate } = useMutation({
    mutationFn: () =>
      formsClient.nasesControllerUpdateForm(
        formId,
        {
          formDataJson: formData,
          // `null` must be set explicitly, otherwise the signature would not be removed if needed
          formSignature: signature ?? null,
        },
        { authStrategy: 'authOrGuestWithToken' },
      ),
    networkMode: 'always',
    onSuccess: () => {
      closeSnackbarInfo()
    },
    onMutate: () => {
      // TODO: Wording.
      openSnackbarInfo(t('useFormRedirects.save_concept.on_mutate_snackbar_message'))
      turnOffLeaveProtection()
    },
    onError: () => {
      // Maybe different wording for this case.
      openSnackbarError(t('useFormRedirects.save_concept.on_error_snackbar_message'))
    },
  })

  const register = () => {
    saveConceptMutate(undefined, {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onSuccess: async () => {
        await router.push(getRouteWithCurrentUrlRedirect(ROUTES.REGISTER))
      },
    })
  }

  const login = () => {
    saveConceptMutate(undefined, {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onSuccess: async () => {
        await router.push(getRouteWithCurrentUrlRedirect(ROUTES.LOGIN))
      },
    })
  }

  const verifyIdentity = () => {
    saveConceptMutate(undefined, {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onSuccess: async () => {
        await router.push(getRouteWithCurrentUrlRedirect(ROUTES.IDENTITY_VERIFICATION))
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
