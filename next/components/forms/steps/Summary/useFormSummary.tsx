import { formsApi } from '@clients/forms'
import { useMutation } from '@tanstack/react-query'
import React, { createContext, PropsWithChildren, useContext, useMemo } from 'react'

import { AccountType } from '../../../../frontend/dtos/accountDto'
import { useServerSideAuth } from '../../../../frontend/hooks/useServerSideAuth'
import { validateSummary } from '../../../../frontend/utils/form'
import { checkPathForErrors } from '../../../../frontend/utils/formSummary'
import { useFormState } from '../../FormStateProvider'
import { RegistrationModalType } from '../../segments/RegistrationModal/RegistrationModal'
import { useFormFileUpload } from '../../useFormFileUpload'
import { useFormModals } from '../../useFormModals'

const useGetContext = () => {
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
    setSendConfirmationModal,
    setSendFilesScanningNotVerifiedEidModal,
    setSendIdentityMissingModal,
    setSendFilesScanningNonAuthenticatedEidModal,
    setSendFilesUploadingModal,
    setSendConfirmationEidModal,
    setSendConfirmationEidLegalModal,
    setSendConfirmationNonAuthenticatedEidModal,
  } = useFormModals()
  const { getFileInfoById } = useFormFileUpload()

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
      onMutate: () => {
        // openSnackbarInfo(t('info_messages.concept_save'))
      },
      onSuccess: () => {
        // openSnackbarSuccess(t('success_messages.concept_save'))
        // setConceptSaveErrorModal(false)
      },
      onError: () => {
        // closeSnackbarInfo()
        // setConceptSaveErrorModal(true)
      },
    },
  )

  const fieldHasError = (fieldId: string) => checkPathForErrors(fieldId, errorSchema)

  const hasErrors = Object.keys(errorSchema).length > 0

  const submitDisabled =
    false && (hasErrors || infectedFiles.length > 0 || uploadingFiles.length > 0)

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

    //
    if (scanningFiles.length > 0) {
      setSendFilesScanningModal(true) // TODO callback
      return
      //   TODO scanning
      // return
    }

    setSendConfirmationModal(true) // TODO callback

    await sendFormMutate()
  }

  const sendEid = (agreement: boolean) => {
    if (!agreement || submitDisabled || sendFormIsLoading) {
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

    if (!isAuthenticated) {
      setSendConfirmationNonAuthenticatedEidModal(true) // callback
      return
    }

    if (accountType === AccountType.FyzickaOsoba) {
      setSendConfirmationEidModal(true) // callback
      return
    }

    if (
      accountType === AccountType.PravnickaOsoba ||
      accountType === AccountType.FyzickaOsobaPodnikatel
    ) {
      setSendConfirmationEidLegalModal(true) // callback
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
