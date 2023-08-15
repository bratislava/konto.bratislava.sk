import { useServerSideAuth } from 'frontend/hooks/useServerSideAuth'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { useFormExportImport } from '../../../../frontend/hooks/useFormExportImport'
import { useFormState } from '../../FormStateProvider'
import Button from '../../simple-components/ButtonNew'
import { useFormModals } from '../../useFormModals'
import MessageModal, { MessageModalProps } from '../../widget-components/Modals/MessageModal'
import IdentityVerificationModal from '../IdentityVerificationModal/IdentityVerificationModal'
import OldSchemaVersionModal from '../OldSchemaVersionModal/OldSchemaVersionModal'
import RegistrationModal from '../RegistrationModal/RegistrationModal'

const FormModals = () => {
  const { t } = useTranslation('forms')
  const { skipModal } = useFormState()

  const {
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
  } = useFormModals()
  const { saveConcept, saveConceptIsLoading } = useFormExportImport()

  const messageModals: (MessageModalProps & { key: string })[] = [
    {
      key: 'skipStepModal',
      isOpen: skipModal.open,
      onOpenChange: skipModal.onOpenChange,
      title: t('skip_step_modal.title'),
      type: 'error',
      buttons: [
        <Button onPress={() => skipModal.onSkip()}>
          {t('skip_step_modal.button_secondary_title')}
        </Button>,
        <Button variant="category-solid" onPress={() => skipModal.onOpenChange(false)}>
          {t('skip_step_modal.button_primary_title')}
        </Button>,
      ],
      children: t('concept_save_error_modal.text'),
    },
    {
      key: 'conceptSaveErrorModal',
      isOpen: conceptSaveErrorModal,
      onOpenChange: setConceptSaveErrorModal,
      type: 'error',
      title: t('concept_save_error_modal.title'),
      buttons: [
        <Button onPress={() => setConceptSaveErrorModal(false)}>
          {t('concept_save_error_modal.button_back_text')}
        </Button>,
        <Button
          variant="category-solid"
          onPress={() => saveConcept(true)}
          isLoading={saveConceptIsLoading}
        >
          {t('concept_save_error_modal.button_repeat_text')}
        </Button>,
      ],
      children: t('concept_save_error_modal.content'),
    },
    {
      key: 'sendFilesScanningModal',
      isOpen: sendFilesScanningModal,
      onOpenChange: setSendFilesScanningModal,
      title: t('send_files_scanning_modal.title'),
      type: 'warning',
      buttons: [
        <Button onPress={() => setSendFilesScanningModal(false)}>
          {t('concept_save_error_modal.button_back_text')}
        </Button>,
        <Button variant="black-solid" onPress={() => skipModal.onSkip()}>
          {t('send_files_scanning_modal.button_title')}
        </Button>,
      ],
      children: t('send_files_scanning_modal.content'),
    },
    {
      key: 'sendFilesScanningEidModal',
      isOpen: sendFilesScanningEidModal,
      onOpenChange: setSendFilesScanningEidModal,
      title: t('send_files_scanning_eid_modal.title'),
      type: 'warning',
      buttons: [
        <Button onPress={() => setSendFilesScanningEidModal(false)}>
          {t('concept_save_error_modal.button_back_text')}
        </Button>,
        <Button variant="black-solid" onPress={() => skipModal.onSkip()}>
          {t('send_files_scanning_eid_modal.button_title')}
        </Button>,
      ],
      children: t('send_files_scanning_eid_modal.content'),
    },
    {
      key: 'sendConfirmationModal',
      isOpen: sendConfirmationModal,
      onOpenChange: setSendConfirmationModal,
      title: t('send_confirmation_modal.title'),
      type: 'info',
      buttons: [
        <Button onPress={() => setSendConfirmationModal(false)}>
          {t('concept_save_error_modal.button_back_text')}
        </Button>,
        <Button variant="black-solid" onPress={() => skipModal.onSkip()}>
          {t('send_confirmation_modal.button_title')}
        </Button>,
      ],
      children: t('send_confirmation_modal.content'),
    },
    {
      key: 'sendFilesScanningNotVerifiedEidModal',
      isOpen: sendFilesScanningNotVerifiedEidModal,
      onOpenChange: setSendFilesScanningNotVerifiedEidModal,
      title: t('send_files_scanning_not_verified_eid_modal.title'),
      type: 'warning',
      buttons: [
        <Button onPress={() => setSendFilesScanningNotVerifiedEidModal(false)}>
          {t('concept_save_error_modal.button_back_text')}
        </Button>,
        <Button variant="black-solid" onPress={() => skipModal.onSkip()}>
          {t('send_files_scanning_not_verified_eid_modal.button_title')}
        </Button>,
      ],
      children: t('send_files_scanning_not_verified_eid_modal.content'),
    },
    {
      key: 'sendIdentityMissingModal',
      isOpen: sendIdentityMissingModal,
      onOpenChange: setSendIdentityMissingModal,
      title: t('send_identity_missing_modal.title'),
      type: 'warning',
      buttons: [
        <Button onPress={() => setSendIdentityMissingModal(false)}>
          {t('concept_save_error_modal.button_back_text')}
        </Button>,
        <Button variant="black-solid" onPress={() => skipModal.onSkip()}>
          {t('send_identity_missing_modal.button_title')}
        </Button>,
      ],
      children: t('send_identity_missing_modal.content'),
    },
    {
      key: 'sendFilesScanningNonAuthenticatedEidModal',
      isOpen: sendFilesScanningNonAuthenticatedEidModal,
      onOpenChange: setSendFilesScanningNonAuthenticatedEidModal,
      title: t('send_files_scanning_non_authenticated_eid_modal.title'),
      type: 'warning',
      buttons: [
        <Button onPress={() => setSendFilesScanningNonAuthenticatedEidModal(false)}>
          {t('concept_save_error_modal.button_back_text')}
        </Button>,
        <Button variant="black-solid" onPress={() => skipModal.onSkip()}>
          {t('send_files_scanning_non_authenticated_eid_modal.button_title')}
        </Button>,
      ],
      children: t('send_files_scanning_non_authenticated_eid_modal.content'),
    },
    {
      key: 'sendFilesUploadingModal',
      isOpen: sendFilesUploadingModal,
      onOpenChange: setSendFilesUploadingModal,
      title: t('send_files_uploading_modal.title'),
      type: 'warning',
      buttons: [
        <Button onPress={() => setSendFilesUploadingModal(false)}>
          {t('concept_save_error_modal.button_back_text')}
        </Button>,
        <Button variant="black-solid" onPress={() => skipModal.onSkip()}>
          {t('send_files_uploading_modal.button_title')}
        </Button>,
      ],
      children: t('send_files_uploading_modal.content'),
    },
    {
      key: 'sendConfirmationEidModal',
      isOpen: sendConfirmationEidModal,
      onOpenChange: setSendConfirmationEidModal,
      title: t('send_confirmation_eid_modal.title'),
      type: 'info',
      buttons: [
        <Button onPress={() => setSendConfirmationEidModal(false)}>
          {t('concept_save_error_modal.button_back_text')}
        </Button>,
        <Button variant="black-solid" onPress={() => skipModal.onSkip()}>
          {t('send_confirmation_eid_modal.button_title')}
        </Button>,
      ],
      children: t('send_confirmation_eid_modal.content'),
    },
    {
      key: 'sendConfirmationEidLegalModal',
      isOpen: sendConfirmationEidLegalModal,
      onOpenChange: setSendConfirmationEidLegalModal,
      title: t('send_confirmation_eid_legal_modal.title'),
      type: 'info',
      buttons: [
        <Button onPress={() => setSendConfirmationEidLegalModal(false)}>
          {t('concept_save_error_modal.button_back_text')}
        </Button>,
        <Button variant="black-solid" onPress={() => skipModal.onSkip()}>
          {t('send_confirmation_eid_legal_modal.button_title')}
        </Button>,
      ],
      children: t('send_confirmation_eid_legal_modal.content'),
    },
    {
      key: 'sendConfirmationNonAuthenticatedEidModal',
      isOpen: sendConfirmationNonAuthenticatedEidModal,
      onOpenChange: setSendConfirmationNonAuthenticatedEidModal,
      title: t('send_confirmation_non_authenticated_eid_modal.title'),
      type: 'info',
      buttons: [
        <Button onPress={() => setSendConfirmationNonAuthenticatedEidModal(false)}>
          {t('concept_save_error_modal.button_back_text')}
        </Button>,
        <Button variant="black-solid" onPress={() => skipModal.onSkip()}>
          {t('send_confirmation_non_authenticated_eid_modal.button_title')}
        </Button>,
      ],
      children: t('send_confirmation_non_authenticated_eid_modal.content'),
    },
  ]

  const { accountType } = useServerSideAuth()

  return (
    <>
      <OldSchemaVersionModal
        isOpen={oldSchemaModal}
        onOpenChange={setOldSchemaModal}
        isDismissable
      />
      <RegistrationModal
        type={registrationModal}
        isOpen={registrationModal != null}
        onOpenChange={(value) => {
          if (value) {
            setRegistrationModal(null)
          }
        }}
        isDismissable
      />
      <IdentityVerificationModal
        isOpen={identityVerificationModal}
        onOpenChange={setIdentityVerificationModal}
        accountType={accountType}
        isDismissable
      />
      {messageModals.map((modalProps) => (
        <MessageModal {...modalProps} />
      ))}
    </>
  )
}

export default FormModals
