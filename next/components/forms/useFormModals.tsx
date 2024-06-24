import { useRouter } from 'next/router'
import React, { createContext, PropsWithChildren, useContext, useState } from 'react'

import { useSsrAuth } from '../../frontend/hooks/useSsrAuth'
import { FORM_SEND_EID_TOKEN_QUERY_KEY } from '../../frontend/utils/formSend'
import { RegistrationModalType } from './segments/RegistrationModal/RegistrationModal'
import { TaxFormPdfExportModalState } from './segments/TaxFormPdfExportModal/TaxFormPdfExportModalState'
import { useFormContext } from './useFormContext'

type ModalWithSendCallback =
  | {
      isOpen: false
    }
  | {
      isOpen: true
      sendCallback: (() => void) | (() => Promise<void>)
    }

const useGetContext = () => {
  const { formMigrationRequired, isTaxForm } = useFormContext()
  const router = useRouter()
  const { isSignedIn, tierStatus } = useSsrAuth()

  // If the form has been sent via eID we don't want to display the initial warning modals.
  const displayInitialWarningModals = !router.query[FORM_SEND_EID_TOKEN_QUERY_KEY]

  const [conceptSaveErrorModal, setConceptSaveErrorModal] = useState(false)
  const [migrationRequiredModal, setMigrationRequiredModal] = useState<boolean>(
    displayInitialWarningModals && formMigrationRequired,
  )
  const [registrationModal, setRegistrationModal] = useState<RegistrationModalType | null>(
    displayInitialWarningModals && !isSignedIn && !isTaxForm ? RegistrationModalType.Initial : null,
  )
  const [identityVerificationModal, setIdentityVerificationModal] = useState(
    displayInitialWarningModals &&
      !migrationRequiredModal &&
      isSignedIn &&
      !isTaxForm &&
      !tierStatus.isIdentityVerified,
  )

  const [sendFilesScanningEidModal, setSendFilesScanningEidModal] = useState<ModalWithSendCallback>(
    { isOpen: false },
  )
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
  const [sendFilesScanningNotVerified, setSendFilesScanningNotVerified] =
    useState<ModalWithSendCallback>({ isOpen: false })
  const [deleteConceptModal, setDeleteConceptModal] = useState<ModalWithSendCallback>({
    isOpen: false,
  })
  const [eidSendingModal, setEidSendingModal] = useState(false)
  const [eidSendErrorModal, setEidSendErrorModal] = useState<ModalWithSendCallback>({
    isOpen: false,
  })
  const [sendPending, setSendPending] = useState(false)
  const [sendEidSaveConceptPending, setSendEidSaveConceptPending] = useState(false)
  const [sendEidPending, setSendEidPending] = useState(false)
  /*
   * This is set to true when user confirms eID form send. It is irreversible and forbids the user to close the modal / edit the data / send the form
   * again while redirecting.
   */
  const [redirectingToSlovenskoSkLogin, setRedirectingToSlovenskoSkLogin] = useState(false)
  const [signerIsDeploying, setSignerIsDeploying] = useState(false)

  const eidSendConfirmationModalIsPending =
    sendEidSaveConceptPending || redirectingToSlovenskoSkLogin

  const [taxFormPdfExportModal, setTaxFormPdfExportModal] =
    useState<TaxFormPdfExportModalState | null>(null)

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
    sendFilesScanningEidModal,
    setSendFilesScanningEidModal,
    sendFilesScanningNotVerifiedEidModal,
    setSendFilesScanningNotVerifiedEidModal,
    sendFilesScanningNotVerified,
    setSendFilesScanningNotVerified,
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
    sendPending,
    setSendPending,
    eidSendingModal,
    setEidSendingModal,
    eidSendErrorModal,
    setEidSendErrorModal,
    setSendEidSaveConceptPending,
    sendEidPending,
    setSendEidPending,
    setRedirectingToSlovenskoSkLogin,
    eidSendConfirmationModalIsPending,
    deleteConceptModal,
    setDeleteConceptModal,
    taxFormPdfExportModal,
    setTaxFormPdfExportModal,
    signerIsDeploying,
    setSignerIsDeploying,
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
