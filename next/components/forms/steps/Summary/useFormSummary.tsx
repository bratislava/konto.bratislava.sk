import { formsApi } from '@clients/forms'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'next-i18next'
import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo } from 'react'

import { AccountType } from '../../../../frontend/dtos/accountDto'
import { useServerSideAuth } from '../../../../frontend/hooks/useServerSideAuth'
import useSnackbar from '../../../../frontend/hooks/useSnackbar'
import { validateSummary } from '../../../../frontend/utils/form'
import { checkPathForErrors } from '../../../../frontend/utils/formSummary'
import { RegistrationModalType } from '../../segments/RegistrationModal/RegistrationModal'
import { useFormFileUpload } from '../../useFormFileUpload'
import { useFormModals } from '../../useFormModals'
import { useFormSent } from '../../useFormSent'
import { useFormState } from '../../useFormState'

const useGetContext = () => {
  const { t } = useTranslation('forms')
  const [openSnackbarError] = useSnackbar({ variant: 'error' })

  const { formId, formData, schema } = useFormState()
  const {
    isAuthenticated,
    accountType,
    tierStatus: { isIdentityVerified },
  } = useServerSideAuth()

  const {
    setRegistrationModal,
    setSendFilesScanningModal,
    setSendFilesScanningEidModal,
    setSendFilesScanningNotVerifiedEidModal,
    setSendIdentityMissingModal,
    setSendFilesScanningNonAuthenticatedEidModal,
    setSendFilesUploadingModal,
    setSendConfirmationModal,
    setSendConfirmationEidModal,
    setSendConfirmationEidLegalModal,
    setSendConfirmationNonAuthenticatedEidModal,
    setSendConfirmationLoading,
  } = useFormModals()
  const { getFileInfoById } = useFormFileUpload()
  const { setFormIsSent } = useFormSent()

  const { errorSchema, infectedFiles, uploadingFiles, scanningFiles } = useMemo(
    () => validateSummary(schema, formData, getFileInfoById),
    [formData, schema, getFileInfoById],
  )

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
      onError: () => {
        openSnackbarError(t('form_send_error'))
      },
    },
  )

  useEffect(() => {
    setSendConfirmationLoading(sendFormIsLoading)
  }, [sendFormIsLoading, setSendConfirmationLoading])

  const fieldHasError = (fieldId: string) => checkPathForErrors(fieldId, errorSchema)

  const hasErrors = Object.keys(errorSchema).length > 0

  const submitDisabled = hasErrors || infectedFiles.length > 0

  const send = async (agreement: boolean) => {
    if (!agreement || submitDisabled || sendFormIsLoading) {
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

  const sendEid = (agreement: boolean) => {
    if (!agreement || submitDisabled || sendFormIsLoading) {
      return
    }

    if (uploadingFiles.length > 0) {
      setSendFilesUploadingModal(true)
      return
    }

    if (isAuthenticated && isIdentityVerified && scanningFiles.length > 0) {
      setSendFilesScanningEidModal(true)
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
      sendCallback: async () => {},
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
    errorSchema,
    infectedFiles,
    uploadingFiles,
    scanningFiles,
    fieldHasError,
    hasErrors,
    submitDisabled,
    send,
    sendEid,
  }
}

const FormSummaryContext = createContext<ReturnType<typeof useGetContext> | undefined>(undefined)

export const FormSummaryProvider = ({ children }: PropsWithChildren) => {
  const context = useGetContext()

  return <FormSummaryContext.Provider value={context}>{children}</FormSummaryContext.Provider>
}

export const useFormSummary = () => {
  const context = useContext(FormSummaryContext)
  if (!context) {
    throw new Error('useFormSummary must be used within a FormSummaryProvider')
  }

  return context
}
