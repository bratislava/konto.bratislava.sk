import React, { createContext, PropsWithChildren, useContext, useState } from 'react'

import { useServerSideAuth } from '../../frontend/hooks/useServerSideAuth'
import { InitialFormData } from '../../frontend/types/initialFormData'
import { RegistrationModalType } from './segments/RegistrationModal/RegistrationModal'

type ModalWithCallback =
  | {
      isOpen: false
    }
  | {
      isOpen: true
      sendCallback: () => void
    }

const useGetContext = (initialFormData: InitialFormData) => {
  const { isAuthenticated, tierStatus } = useServerSideAuth()

  const [conceptSaveErrorModal, setConceptSaveErrorModal] = useState(false)
  const [oldVersionSchemaModal, setOldSchemaVersionModal] = useState<boolean>(
    initialFormData.oldSchemaVersion,
  )
  const [registrationModal, setRegistrationModal] = useState<RegistrationModalType | null>(
    !oldVersionSchemaModal && !isAuthenticated ? RegistrationModalType.Initial : null,
  )
  // const [identityVerificationModal, setIdentityVerificationModal] = useState(
  //   !oldVersionSchemaModal && isAuthenticated && !tierStatus.isIdentityVerified,
  // )
  const [identityVerificationModal, setIdentityVerificationModal] = useState(true)

  const [sendFilesScanningEidModal, setSendFilesScanningEidModal] = useState(false)
  const [sendFilesScanningNotVerifiedEidModal, setSendFilesScanningNotVerifiedEidModal] =
    useState(false)
  const [sendIdentityMissingModal, setSendIdentityMissingModal] = useState(false)
  const [sendFilesScanningNonAuthenticatedEidModal, setSendFilesScanningNonAuthenticatedEidModal] =
    useState(false)
  const [sendFilesUploadingModal, setSendFilesUploadingModal] = useState(false)
  const [sendConfirmationModal, setSendConfirmationModal] = useState<ModalWithCallback>({
    isOpen: false,
  })
  const [sendConfirmationEidModal, setSendConfirmationEidModal] = useState<ModalWithCallback>({
    isOpen: false,
  })
  const [sendFilesScanningModal, setSendFilesScanningModal] = useState<ModalWithCallback>({
    isOpen: false,
  })
  const [sendConfirmationEidLegalModal, setSendConfirmationEidLegalModal] =
    useState<ModalWithCallback>({ isOpen: false })
  const [sendConfirmationNonAuthenticatedEidModal, setSendConfirmationNonAuthenticatedEidModal] =
    useState<ModalWithCallback>({ isOpen: false })
  const [sendConfirmationLoading, setSendConfirmationLoading] = useState(false)
  const [sendConfirmationEidLoading, setSendConfirmationEidLoading] = useState(false)

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
    sendConfirmationLoading,
    setSendConfirmationLoading,
    sendConfirmationEidLoading,
    setSendConfirmationEidLoading,
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
