import { formsApi } from '@clients/forms'
import { SendFormResponseDto } from '@clients/openapi-forms'
import { useMutation } from '@tanstack/react-query'
import { AxiosResponse, isAxiosError } from 'axios'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import React, { createContext, PropsWithChildren, useContext, useEffect, useRef } from 'react'
import { useEffectOnce } from 'usehooks-ts'

import { environment } from '../../environment'
import { AccountType } from '../../frontend/dtos/accountDto'
import { useServerSideAuth } from '../../frontend/hooks/useServerSideAuth'
import useSnackbar from '../../frontend/hooks/useSnackbar'
import { validateSummary } from '../../frontend/utils/form'
import { FORM_SEND_EID_TOKEN_QUERY_KEY, popSendEidMetadata, setSendEidMetadata } from '../../frontend/utils/formSend'
import { isFormSubmitDisabled } from '../../frontend/utils/formSummary'
import { RegistrationModalType } from './segments/RegistrationModal/RegistrationModal'
import { useFormFileUpload } from './useFormFileUpload'
import { useFormLeaveProtection } from './useFormLeaveProtection'
import { useFormModals } from './useFormModals'
import { useFormSent } from './useFormSent'
import { useFormState } from './useFormState'

const useGetContext = () => {
  const router = useRouter()

  const { t } = useTranslation('forms')
  const [openSnackbarError] = useSnackbar({ variant: 'error' })
  // As the token is immediately removed from the URL, we need to store it in a ref.
  const sendEidTokenRef = useRef<string | null>(null)

  const { formId, formSlug, formData, schema } = useFormState()
  const { getFileInfoById } = useFormFileUpload()
  const {
    isAuthenticated,
    accountType,
    tierStatus: { isIdentityVerified },
  } = useServerSideAuth()
  const { turnOffLeaveProtection } = useFormLeaveProtection()

  const {
    setRegistrationModal,
    setSendIdentityMissingModal,
    setSendFilesScanningModal,
    setSendFilesScanningEidModal,
    setSendFilesScanningNotVerifiedEidModal,
    setSendFilesScanningNonAuthenticatedEidModal,
    setSendFilesUploadingModal,
    setSendConfirmationModal,
    setSendConfirmationEidModal,
    setSendConfirmationEidLegalModal,
    setSendConfirmationNonAuthenticatedEidModal,
    setSendLoading,
    setEidSendingModal,
    setEidSendErrorModal,
    setSendEidSaveConceptLoading,
    setSendEidLoading,
    setRedirectingToSlovenskoSkLogin,
  } = useFormModals()
  const { setFormIsSent } = useFormSent()

  const { mutate: sendFormMutate, isLoading: sendFormIsLoading } = useMutation(
    () =>
      formsApi.nasesControllerSendAndUpdateForm(
        formId,
        {
          formDataJson: formData,
        },
        { accessToken: 'always' },
      ),
    {
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
    },
  )

  const { mutate: saveConceptAndSendEidMutate, isLoading: saveConceptAndSendEidIsLoading } =
    useMutation(
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
        onSuccess: async () => {
          setSendEidMetadata({ formSlug, formId })
          turnOffLeaveProtection()
          window.location.href = environment.slovenskoSkLoginUrl
          setRedirectingToSlovenskoSkLogin(true)
        },
        onError: () => {
          openSnackbarError(t('form_send_error'))
        },
      },
    )

  const { mutate: sendFormEidMutate, isLoading: sendFormEidIsLoading } = useMutation<
    AxiosResponse<SendFormResponseDto>,
    unknown,
    { fromRepeatModal?: boolean }
  >(
    () =>
      formsApi.nasesControllerSendAndUpdateFormEid(
        formId,
        {
          formDataJson: formData,
        },
        { headers: { Authorization: `Bearer ${sendEidTokenRef.current as string}` } },
      ),
    {
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
          sendCallback: () => {
            if (!sendFormEidIsLoading) {
              sendFormEidMutate({ fromRepeatModal: true })
            }
          },
        })
        if (fromRepeatModal) {
          openSnackbarError(t('form_send_error'))
        }
      },
    },
  )

  useEffect(() => {
    setSendLoading(sendFormIsLoading)
  }, [sendFormIsLoading, setSendLoading])

  useEffect(() => {
    setSendEidSaveConceptLoading(saveConceptAndSendEidIsLoading)
  }, [saveConceptAndSendEidIsLoading, setSendEidSaveConceptLoading])

  useEffect(() => {
    setSendEidLoading(sendFormEidIsLoading)
  }, [sendFormEidIsLoading, setSendEidLoading])

  /**
   * As we don't want users to trigger the send again by reload we immediately remove the token from the URL.
   */
  const removeSendIdTokenFromUrl = () => {
    const url = new URL(window.location.href)
    const params = new URLSearchParams(url.search)
    params.delete(FORM_SEND_EID_TOKEN_QUERY_KEY)
    // eslint-disable-next-line scanjs-rules/assign_to_search
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
    if (router.query[FORM_SEND_EID_TOKEN_QUERY_KEY] && !sendFormEidIsLoading) {
      sendEidTokenRef.current = router.query[FORM_SEND_EID_TOKEN_QUERY_KEY] as string

      removeSendIdTokenFromUrl()

      setEidSendingModal(true)
      sendFormEidMutate({})
    }
  })

  const handleSendButtonPress = async () => {
    const { errorSchema, infectedFiles, uploadingFiles, scanningFiles } = validateSummary(
      schema,
      formData,
      getFileInfoById,
    )
    const submitDisabled = isFormSubmitDisabled(errorSchema, infectedFiles)

    if (submitDisabled || sendFormIsLoading) {
      return
    }

    if (!isAuthenticated) {
      setRegistrationModal(RegistrationModalType.NotAuthenticatedSubmitForm)
      return
    }

    if (!isIdentityVerified) {
      setSendIdentityMissingModal(true)
      return
    }

    if (uploadingFiles.length > 0) {
      setSendFilesUploadingModal(true)
      return
    }

    const modalValue = {
      isOpen: true,
      sendCallback: () => sendFormMutate(),
    }

    if (scanningFiles.length > 0) {
      setSendFilesScanningModal(modalValue)
      return
    }

    setSendConfirmationModal(modalValue)
  }

  const handleSendEidButtonPress = () => {
    const { errorSchema, infectedFiles, uploadingFiles, scanningFiles } = validateSummary(
      schema,
      formData,
      getFileInfoById,
    )
    const submitDisabled = isFormSubmitDisabled(errorSchema, infectedFiles)

    if (submitDisabled || sendFormEidIsLoading) {
      return
    }

    if (uploadingFiles.length > 0) {
      setSendFilesUploadingModal(true)
      return
    }

    if (isAuthenticated && isIdentityVerified && scanningFiles.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      setSendFilesScanningEidModal({ isOpen: true, sendCallback: () => handleSendButtonPress() })
      return
    }

    if (isAuthenticated && !isIdentityVerified && scanningFiles.length > 0) {
      setSendFilesScanningNotVerifiedEidModal(true)
      return
    }

    if (!isAuthenticated && scanningFiles.length > 0) {
      setSendFilesScanningNonAuthenticatedEidModal(true)
      return
    }

    const modalValue = {
      isOpen: true,
      sendCallback: async () => {
        saveConceptAndSendEidMutate()
      },
    }

    if (!isAuthenticated) {
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
    handleSendButtonPress,
    handleSendEidButtonPress,
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
