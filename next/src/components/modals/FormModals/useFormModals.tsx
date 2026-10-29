import { SendAllowedForUserResult } from 'forms-shared/send-policy/sendPolicy'
import { useRouter } from 'next/router'
import React, { createContext, PropsWithChildren, useContext, useState } from 'react'

import { useFormContext } from '@/src/components/forms/useFormContext'
import { RegistrationModalType } from '@/src/components/modals/RegistrationModal'
import { TaxFormPdfExportModalState } from '@/src/components/modals/TaxFormPdfExportModal/TaxFormPdfExportModalState'
import { NASES_TOKEN_QUERY_KEY } from '@/src/frontend/utils/metadataStorage'

type ModalWithConfirmCallback =
  | {
      isOpen: false
    }
  | {
      isOpen: true
      confirmCallback: (() => void) | (() => Promise<void>)
    }

enum InitialModal {
  Registration = 'Registration',
  MigrationRequired = 'MigrationRequired',
  IdentityVerification = 'IdentityVerification',
}

const useInitialModal = () => {
  const {
    formMigrationRequired,
    evaluatedSendPolicy: { sendAllowedForUserResult },
  } = useFormContext()
  const router = useRouter()

  // If the form has been sent via eID we don't want to display the initial warning modals.
  const hasFormSendEidToken = router.query[NASES_TOKEN_QUERY_KEY]
  if (hasFormSendEidToken) {
    return null
  }

  if (formMigrationRequired) {
    return InitialModal.MigrationRequired
  }

  if (
    sendAllowedForUserResult === SendAllowedForUserResult.AuthenticationMissing ||
    sendAllowedForUserResult === SendAllowedForUserResult.AuthenticationAndVerificationMissing
  ) {
    return InitialModal.Registration
  }

  if (sendAllowedForUserResult === SendAllowedForUserResult.VerificationMissing) {
    return InitialModal.IdentityVerification
  }

  return null
}

const useGetContext = () => {
  const initialModal = useInitialModal()
  const [migrationRequiredModal, setMigrationRequiredModal] = useState(
    initialModal === InitialModal.MigrationRequired,
  )
  const [registrationModal, setRegistrationModal] = useState<RegistrationModalType | null>(
    initialModal === InitialModal.Registration ? RegistrationModalType.Initial : null,
  )
  const [identityVerificationModal, setIdentityVerificationModal] = useState(
    initialModal === InitialModal.IdentityVerification,
  )

  const [conceptSaveErrorModal, setConceptSaveErrorModal] = useState(false)
  const [sendIdentityMissingModal, setSendIdentityMissingModal] = useState(false)
  const [sendFilesUploadingModal, setSendFilesUploadingModal] = useState(false)
  const [sendConfirmationModal, setSendConfirmationModal] = useState<ModalWithConfirmCallback>({
    isOpen: false,
  })
  const [sendConfirmationEidModal, setSendConfirmationEidModal] =
    useState<ModalWithConfirmCallback>({
      isOpen: false,
    })
  const [sendFilesScanningModal, setSendFilesScanningModal] = useState(false)
  const [sendConfirmationEidLegalModal, setSendConfirmationEidLegalModal] =
    useState<ModalWithConfirmCallback>({ isOpen: false })
  const [sendConfirmationNonAuthenticatedEidModal, setSendConfirmationNonAuthenticatedEidModal] =
    useState<ModalWithConfirmCallback>({ isOpen: false })
  const [deleteConceptModal, setDeleteConceptModal] = useState<ModalWithConfirmCallback>({
    isOpen: false,
  })
  const [eidSendingModal, setEidSendingModal] = useState(false)
  const [eidSendErrorModal, setEidSendErrorModal] = useState<ModalWithConfirmCallback>({
    isOpen: false,
  })
  const [signerIsDeploying, setSignerIsDeploying] = useState(false)

  const [taxFormPdfExportModal, setTaxFormPdfExportModal] =
    useState<TaxFormPdfExportModalState | null>(null)

  const [xmlImportVersionConfirmationModal, setXmlImportVersionConfirmationModal] =
    useState<ModalWithConfirmCallback>({ isOpen: false })

  return {
    migrationRequiredModal,
    setMigrationRequiredModal,
    registrationModal,
    setRegistrationModal,
    identityVerificationModal,
    setIdentityVerificationModal,
    conceptSaveErrorModal,
    setConceptSaveErrorModal,
    sendFilesScanningModal,
    setSendFilesScanningModal,
    sendIdentityMissingModal,
    setSendIdentityMissingModal,
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
    eidSendingModal,
    setEidSendingModal,
    eidSendErrorModal,
    setEidSendErrorModal,
    deleteConceptModal,
    setDeleteConceptModal,
    taxFormPdfExportModal,
    setTaxFormPdfExportModal,
    signerIsDeploying,
    setSignerIsDeploying,
    xmlImportVersionConfirmationModal,
    setXmlImportVersionConfirmationModal,
  }
}

const FormModalsContext = createContext<ReturnType<typeof useGetContext> | undefined>(undefined)

export const FormModalsProvider = ({ children }: PropsWithChildren) => {
  const context = useGetContext()

  return <FormModalsContext.Provider value={context}>{children}</FormModalsContext.Provider>
}

export const useFormModals = () => {
  const context = useContext(FormModalsContext)
  if (!context) {
    throw new Error('useFormModals must be used within a FormModalsProvider')
  }

  return context
}
