import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'
import { createContext, PropsWithChildren, useContext } from 'react'

import { formsClient } from '@/src/clients/forms'
import { useFormSignature } from '@/src/components/forms/signer/useFormSignature'
import { useFormContext } from '@/src/components/forms/useFormContext'
import { useFormData } from '@/src/components/forms/useFormData'
import { useFormLeaveProtection } from '@/src/components/forms/useFormLeaveProtection'
import { useQueryParamRedirect } from '@/src/frontend/hooks/useQueryParamRedirect'
import useToast from '../simple-components/Toast/useToast'
import { ROUTES } from '@/src/utils/routes'

const useGetContext = () => {
  const router = useRouter()
  const { getRouteWithCurrentUrlRedirect } = useQueryParamRedirect()
  const { formId } = useFormContext()
  const { formData } = useFormData()
  const { t } = useTranslation('forms')
  const { showToast, closeToasts } = useToast()
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
      closeToasts()
    },
    onMutate: () => {
      // TODO: Wording.
      showToast({
        message: t('useFormRedirects.save_concept.on_mutate_snackbar_message'),
        variant: 'info',
      })
      turnOffLeaveProtection()
    },
    onError: () => {
      // Maybe different wording for this case.
      showToast({
        message: t('useFormRedirects.save_concept.on_error_snackbar_message'),
        variant: 'error',
      })
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
