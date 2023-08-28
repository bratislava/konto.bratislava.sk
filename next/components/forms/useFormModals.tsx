import React, { createContext, PropsWithChildren, useContext, useState } from 'react'

import { useServerSideAuth } from '../../frontend/hooks/useServerSideAuth'
import { InitialFormData } from '../../frontend/types/initialFormData'
import { RegistrationModalType } from './segments/RegistrationModal/RegistrationModal'
import { useFormState } from './useFormState'

type ModalWithSendCallback =
  | {
      isOpen: false
    }
  | {
      isOpen: true
      sendCallback: () => void
    }

const useGetContext = (initialFormData: InitialFormData) => {
  const { isAuthenticated, tierStatus } = useServerSideAuth()
  const { currentStepIndex } = useFormState()
  // If the current step is on summary the form has been sent via eID (see `useStepIndex` in `formState.ts`).
  const displayInitialWarningModals = currentStepIndex !== 'summary'

  const [conceptSaveErrorModal, setConceptSaveErrorModal] = useState(false)
  const [oldVersionSchemaModal, setOldSchemaVersionModal] = useState<boolean>(
    displayInitialWarningModals && initialFormData.oldSchemaVersion,
  )
  const [registrationModal, setRegistrationModal] = useState<RegistrationModalType | null>(
    displayInitialWarningModals && !oldVersionSchemaModal && !isAuthenticated
      ? RegistrationModalType.Initial
      : null,
  )
  const [identityVerificationModal, setIdentityVerificationModal] = useState(
    displayInitialWarningModals &&
      !oldVersionSchemaModal &&
      isAuthenticated &&
      !tierStatus.isIdentityVerified,
  )

  const [sendFilesScanningEidModal, setSendFilesScanningEidModal] = useState<ModalWithSendCallback>({ isOpen: false })
  const [sendFilesScanningNotVerifiedEidModal, setSendFilesScanningNotVerifiedEidModal] =
    useState(false)
  const [sendIdentityMissingModal, setSendIdentityMissingModal] = useState(false)
  const [sendFilesScanningNonAuthenticatedEidModal, setSendFilesScanningNonAuthenticatedEidModal] =
    useState(false)
  const [sendFilesUploadingModal, setSendFilesUploadingModal] = useState(false)
  const [sendConfirmationModal, setSendConfirmationModal] = useState<ModalWithSendCallback>({
    isOpen: false,
  })
  const [sendConfirmationEidModal, setSendConfirmationEidModal] = useState<ModalWithSendCallback>({
    isOpen: false,
  })
  const [sendFilesScanningModal, setSendFilesScanningModal] = useState<ModalWithSendCallback>({
    isOpen: false,
  })
  const [sendConfirmationEidLegalModal, setSendConfirmationEidLegalModal] =
    useState<ModalWithSendCallback>({ isOpen: false })
  const [sendConfirmationNonAuthenticatedEidModal, setSendConfirmationNonAuthenticatedEidModal] =
    useState<ModalWithSendCallback>({ isOpen: false })
  const [eidSendingModal, setEidSendingModal] = useState(false)
  const [eidSendErrorModal, setEidSendErrorModal] = useState<ModalWithSendCallback>({
    isOpen: false,
  })
  const [sendLoading, setSendLoading] = useState(false)
  const [sendEidSaveConceptLoading, setSendEidSaveConceptLoading] = useState(false)
  const [sendEidLoading, setSendEidLoading] = useState(false)
  const [redirectingToSlovenskoSkLogin, setRedirectingToSlovenskoSkLogin] = useState(false)

  const eidSendConfirmationModalIsLoading =
    sendEidSaveConceptLoading || redirectingToSlovenskoSkLogin

  return {
    oldVersionSchemaModal,
    setOldSchemaVersionModal,
    registrationModal,
    setRegistrationModal,
    identityVerificationModal,
    setIdentityVerificationModal,
    conceptSaveErrorModal,
    setConceptSaveErrorModal,
    sendFilesScanningModal,
    setSendFilesScanningModal,
    sendFilesScanningEidModal,
    setSendFilesScanningEidModal,
    sendFilesScanningNotVerifiedEidModal,
    setSendFilesScanningNotVerifiedEidModal,
    sendIdentityMissingModal,
    setSendIdentityMissingModal,
    sendFilesScanningNonAuthenticatedEidModal,
    setSendFilesScanningNonAuthenticatedEidModal,
    sendFilesUploadingModal,
    setSendFilesUploadingModal,
    sendConfirmationModal,
    setSendConfirmationModal,
    sendConfirmationEidModal,
    setSendConfirmationEidModal,
    sendConfirmationEidLegalModal,
    setSendConfirmationEidLegalModal,
    sendConfirmationNonAuthenticatedEidModal,
    setSendConfirmationNonAuthenticatedEidModal,
    sendLoading,
    setSendLoading,
    eidSendingModal,
    setEidSendingModal,
    eidSendErrorModal,
    setEidSendErrorModal,
    setSendEidSaveConceptLoading,
    sendEidLoading,
    setSendEidLoading,
    setRedirectingToSlovenskoSkLogin,
    eidSendConfirmationModalIsLoading,
  }
}

const FormModalsContext = createContext<ReturnType<typeof useGetContext> | undefined>(undefined)

type FormModalsProviderProps = {
  initialFormData: InitialFormData
}

export const FormModalsProvider = ({
  initialFormData,
  children,
}: PropsWithChildren<FormModalsProviderProps>) => {
  const context = useGetContext(initialFormData)

  return <FormModalsContext.Provider value={context}>{children}</FormModalsContext.Provider>
}

export const useFormModals = () => {
  const context = useContext(FormModalsContext)
  if (!context) {
    throw new Error('useFormModals must be used within a FormModalsProvider')
  }

  return context
}
