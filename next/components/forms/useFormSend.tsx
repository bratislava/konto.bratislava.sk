import { formsClient } from '@clients/forms'
import { useMutation } from '@tanstack/react-query'
import { AxiosResponse, isAxiosError } from 'axios'
import { SendAllowedForUserResult } from 'forms-shared/send-policy/sendPolicy'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { SendFormResponseDto } from 'openapi-clients/forms'
import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from 'react'
import { useEffectOnce } from 'usehooks-ts'

import { environment } from '../../environment'
import { AccountType } from '../../frontend/dtos/accountDto'
import useSnackbar from '../../frontend/hooks/useSnackbar'
import { useSsrAuth } from '../../frontend/hooks/useSsrAuth'
import {
  FORM_SEND_EID_TOKEN_QUERY_KEY,
  popSendEidMetadata,
  setSendEidMetadata,
} from '../../frontend/utils/formSend'
import { isFormSubmitDisabled } from '../../frontend/utils/formSummary'
import { RegistrationModalType } from './segments/RegistrationModal/RegistrationModal'
import { useFormSignature } from './signer/useFormSignature'
import { useFormSummary } from './steps/Summary/useFormSummary'
import { useFormContext } from './useFormContext'
import { useFormData } from './useFormData'
import { useFormLeaveProtection } from './useFormLeaveProtection'
import { useFormModals } from './useFormModals'
import { useFormSent } from './useFormSent'

/**
 * This hook controls the sending of the form. The logic is scattered across the app.
 *
 * Form send:
 * 1. The user clicks on the "Odoslať" button.
 * 2. All the conditions in `handleSendButtonPress` are checked. If any of it fails an appropriate modal is shown.
 * 3. Confirmation modal is shown.
 * 4. `sendFormMutate` is called. On success, we redirect to the success page. On error, we show an error.
 *
 *
 * Form eID send:
 * 1. The user clicks on the "Odoslať s eID" button.
 * 2. All the conditions in `handleSendEidButtonPress` are checked. If any of it fails an appropriate modal is shown.
 * 3. Confirmation modal is shown.
 * 4. `saveConceptAndSendEidMutate` is called. This doesn't send the form! This triggers the concept save and redirects to the eID login page.
 *    The concept must be saved so if user comes back or successfully logs in, the form has the correct data. Before redirecting, we store the
 *    metadata (form id and form slug) in the sessionStorage to be able to restore it after the user comes back.
 *
 *    If the user comes back without login, we immediately pop the metadata from the sessionStorage not to be used inappropriately in the future.
 *  5. If user successfully logs in, he/she is redirected to /nases/login with the token in the URL. As it is not possible to parametrize the
 *   redirect URL, the login page retrieves the metadata from the sessionStorage and redirects back to the form URL. The URL contains the token,
 *   which, if it's detected is immediately removed from the URL and the form is sent using `sendFormEidMutate`.
 */

const useGetContext = () => {
  const router = useRouter()

  const { t } = useTranslation('forms')
  const [openSnackbarError] = useSnackbar({ variant: 'error' })
  // As the token is immediately removed from the URL, we need to store it in a ref.
  const sendEidTokenRef = useRef<string | null>(null)
  const {
    formId,
    formDefinition: { slug },
    evaluatedSendPolicy: { sendPossible, sendAllowedForUserResult, eidSendPossible },
  } = useFormContext()
  const { formData } = useFormData()
  const { getValidatedSummary, getUploadFiles, getScanFiles } = useFormSummary()
  const { isSignedIn, accountType } = useSsrAuth()
  const { turnOffLeaveProtection } = useFormLeaveProtection()
  const { isValidSignature, signature } = useFormSignature()

  const {
    setRegistrationModal,
    setSendIdentityMissingModal,
    setSendFilesScanningModal,
    setSendFilesUploadingModal,
    setSendConfirmationModal,
    setSendConfirmationEidModal,
    setSendConfirmationEidLegalModal,
    setSendConfirmationNonAuthenticatedEidModal,
    setSendPending,
    setEidSendingModal,
    setEidSendErrorModal,
    setSendEidSaveConceptPending,
    setSendEidPending,
    setRedirectingToSlovenskoSkLogin,
  } = useFormModals()
  const { setFormIsSent } = useFormSent()

  const { mutate: sendFormMutate, isPending: sendFormIsPending } = useMutation({
    mutationFn: () =>
      formsClient.nasesControllerSendAndUpdateForm(
        formId,
        {
          formDataJson: formData,
        },
        { accessToken: 'onlyAuthenticated' },
      ),
    networkMode: 'always',
    onSuccess: () => {
      setFormIsSent()
    },
    onError: (error) => {
      // A special case when user submits the form, but doesn't receive the response and then tries to send the form again.
      // TODO: Use error code instead of error name from API when fixed & type
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (isAxiosError(error) && error.response?.data?.errorName === 'FORM_NOT_DRAFT_ERROR') {
        setFormIsSent()
        return
      }

      openSnackbarError(t('form_send_error'))
    },
  })

  const { mutate: saveConceptAndSendEidMutate, isPending: saveConceptAndSendEidIsPending } =
    useMutation({
      mutationFn: () =>
        formsClient.nasesControllerUpdateForm(
          formId,
          {
            formDataJson: formData,
            // `null` must be set explicitly, otherwise the signature would not be removed if needed
            formSignature: signature ?? null,
          },
          { accessToken: 'onlyAuthenticated' },
        ),
      networkMode: 'always',
      onSuccess: async () => {
        setSendEidMetadata({ formSlug: slug, formId })
        turnOffLeaveProtection()
        // We are redirecting to a trusted URL
        // eslint-disable-next-line xss/no-location-href-assign
        window.location.href = environment.slovenskoSkLoginUrl
        setRedirectingToSlovenskoSkLogin(true)
      },
      onError: () => {
        openSnackbarError(t('form_send_error'))
      },
    })

  const { mutate: sendFormEidMutate, isPending: sendFormEidIsPending } = useMutation<
    AxiosResponse<SendFormResponseDto>,
    unknown,
    { fromRepeatModal?: boolean }
  >({
    mutationFn: () =>
      formsClient.nasesControllerSendAndUpdateFormEid(
        formId,
        {
          formDataJson: formData,
          // `null` must be set explicitly, otherwise the signature would not be removed if needed
          formSignature: signature ?? null,
          eidToken: sendEidTokenRef.current as string,
        },
        { accessToken: 'onlyAuthenticated' },
      ),
    networkMode: 'always',
    onSuccess: () => {
      setFormIsSent()
    },
    onError: (error, { fromRepeatModal }) => {
      // A special case when user submits the form, but doesn't receive the response and then tries to send the form again.
      // TODO: Use error code instead of error name from API when fixed & type
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (isAxiosError(error) && error.response?.data?.errorName === 'FORM_NOT_DRAFT_ERROR') {
        setFormIsSent()
        return
      }

      setEidSendingModal(false)
      setEidSendErrorModal({
        isOpen: true,
        confirmCallback: () => {
          if (!sendFormEidIsPending) {
            sendFormEidMutate({ fromRepeatModal: true })
          }
        },
      })
      if (fromRepeatModal) {
        openSnackbarError(t('form_send_error'))
      }
    },
  })

  // Loading states must be backpropagated to useFormModals as they are parent context to this one
  // TODO: Come up with better solution
  useEffect(() => {
    setSendPending(sendFormIsPending)
  }, [sendFormIsPending, setSendPending])

  useEffect(() => {
    setSendEidSaveConceptPending(saveConceptAndSendEidIsPending)
  }, [saveConceptAndSendEidIsPending, setSendEidSaveConceptPending])

  useEffect(() => {
    setSendEidPending(sendFormEidIsPending)
  }, [sendFormEidIsPending, setSendEidPending])

  /**
   * As we don't want users to trigger the send again by reload we immediately remove the token from the URL.
   */
  const removeSendIdTokenFromUrl = () => {
    const url = new URL(window.location.href)
    const params = new URLSearchParams(url.search)
    params.delete(FORM_SEND_EID_TOKEN_QUERY_KEY)
    url.search = params.toString()
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    router.replace(url.toString(), undefined, { shallow: true })
  }

  // https://stackoverflow.com/a/74609594
  const effectOnceRan = useRef(false)
  useEffectOnce(() => {
    if (effectOnceRan.current) {
      return
    }
    effectOnceRan.current = true
    popSendEidMetadata()

    // If there is a send token in the URL, send the form via eID.
    if (router.query[FORM_SEND_EID_TOKEN_QUERY_KEY] && !sendFormEidIsPending) {
      sendEidTokenRef.current = router.query[FORM_SEND_EID_TOKEN_QUERY_KEY] as string

      removeSendIdTokenFromUrl()

      setEidSendingModal(true)
      sendFormEidMutate({})
    }
  })

  const submitDisabled = useCallback(
    () => isFormSubmitDisabled(getValidatedSummary(), isValidSignature()),
    [getValidatedSummary, isValidSignature],
  )

  const handleSendButtonPress = () => {
    if (submitDisabled() || sendFormIsPending || !sendPossible) {
      return
    }

    if (
      sendAllowedForUserResult === SendAllowedForUserResult.AuthenticationMissing ||
      sendAllowedForUserResult === SendAllowedForUserResult.AuthenticationAndVerificationMissing
    ) {
      setRegistrationModal(RegistrationModalType.NotAuthenticatedSubmitForm)
      return
    }

    if (sendAllowedForUserResult === SendAllowedForUserResult.VerificationMissing) {
      setSendIdentityMissingModal(true)
      return
    }

    if (sendAllowedForUserResult !== SendAllowedForUserResult.Allowed) {
      throw new Error(`Unhandled case: ${sendAllowedForUserResult}`)
    }

    if (getUploadFiles().length > 0) {
      setSendFilesUploadingModal(true)
      return
    }

    if (getScanFiles().length > 0) {
      setSendFilesScanningModal(true)
      return
    }

    setSendConfirmationModal({
      isOpen: true,
      confirmCallback: () => sendFormMutate(),
    })
  }

  const handleSendEidButtonPress = () => {
    if (submitDisabled() || sendFormEidIsPending || !eidSendPossible) {
      return
    }

    if (getUploadFiles().length > 0) {
      setSendFilesUploadingModal(true)
      return
    }

    if (getScanFiles().length > 0) {
      setSendFilesScanningModal(true)
      return
    }

    const modalValue = {
      isOpen: true,
      confirmCallback: async () => {
        saveConceptAndSendEidMutate()
      },
    }

    if (!isSignedIn) {
      setSendConfirmationNonAuthenticatedEidModal(modalValue)
      return
    }

    if (accountType === AccountType.FyzickaOsoba) {
      setSendConfirmationEidModal(modalValue)
      return
    }

    if (
      accountType === AccountType.PravnickaOsoba ||
      accountType === AccountType.FyzickaOsobaPodnikatel
    ) {
      setSendConfirmationEidLegalModal(modalValue)
    }
  }

  return {
    sendPossible,
    handleSendButtonPress,
    eidSendPossible,
    handleSendEidButtonPress,
    submitDisabled,
  }
}

const FormSendContext = createContext<ReturnType<typeof useGetContext> | undefined>(undefined)

export const FormSendProvider = ({ children }: PropsWithChildren) => {
  const context = useGetContext()

  return <FormSendContext.Provider value={context}>{children}</FormSendContext.Provider>
}

export const useFormSend = () => {
  const context = useContext(FormSendContext)
  if (!context) {
    throw new Error('useFormSend must be used within a FormSendProvider')
  }

  return context
}
