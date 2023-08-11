import React, { createContext, PropsWithChildren, useContext, useState } from 'react'

import { useServerSideAuth } from '../../frontend/hooks/useServerSideAuth'
import { InitialFormData } from '../../frontend/types/initialFormData'
import { RegistrationModalType } from './segments/RegistrationModal/RegistrationModal'

const useGetContext = (initialFormData: InitialFormData) => {
  const { isAuthenticated, tierStatus } = useServerSideAuth()

  const [conceptSaveErrorModal, setConceptSaveErrorModal] = useState(false)
  const [oldSchemaModal, setOldSchemaModal] = useState<boolean>(initialFormData.oldSchemaVersion)
  const [registrationModal, setRegistrationModal] = useState<RegistrationModalType | null>(
    !oldSchemaModal && !isAuthenticated ? RegistrationModalType.Initial : null,
  )
  // const [identityVerificationModal, setIdentityVerificationModal] = useState(
  //   !oldSchemaModal && isAuthenticated && !tierStatus.isIdentityVerified,
  // )
  const [identityVerificationModal, setIdentityVerificationModal] = useState(true)

  const [sendFilesScanningModal, setSendFilesScanningModal] = useState(false)
  const [sendFilesScanningEidModal, setSendFilesScanningEidModal] = useState(false)
  const [sendConfirmationModal, setSendConfirmationModal] = useState(false)
  const [sendFilesScanningNotVerifiedEidModal, setSendFilesScanningNotVerifiedEidModal] =
    useState(false)
  const [sendIdentityMissingModal, setSendIdentityMissingModal] = useState(false)
  const [sendFilesScanningNonAuthenticatedEidModal, setSendFilesScanningNonAuthenticatedEidModal] =
    useState(false)
  const [sendFilesUploadingModal, setSendFilesUploadingModal] = useState(false)
  const [sendConfirmationEidModal, setSendConfirmationEidModal] = useState(false)
  const [sendConfirmationEidLegalModal, setSendConfirmationEidLegalModal] = useState(false)
  const [sendConfirmationNonAuthenticatedEidModal, setSendConfirmationNonAuthenticatedEidModal] =
    useState(false)

  return {
    oldSchemaModal,
    setOldSchemaModal,
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
    sendConfirmationModal,
    setSendConfirmationModal,
    sendFilesScanningNotVerifiedEidModal,
    setSendFilesScanningNotVerifiedEidModal,
    sendIdentityMissingModal,
    setSendIdentityMissingModal,
    sendFilesScanningNonAuthenticatedEidModal,
    setSendFilesScanningNonAuthenticatedEidModal,
    sendFilesUploadingModal,
    setSendFilesUploadingModal,
    sendConfirmationEidModal,
    setSendConfirmationEidModal,
    sendConfirmationEidLegalModal,
    setSendConfirmationEidLegalModal,
    sendConfirmationNonAuthenticatedEidModal,
    setSendConfirmationNonAuthenticatedEidModal,
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
