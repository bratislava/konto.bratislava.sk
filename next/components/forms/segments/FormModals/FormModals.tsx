import { useServerSideAuth } from 'frontend/hooks/useServerSideAuth'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { useFormExportImport } from '../../../../frontend/hooks/useFormExportImport'
import { useFormState } from '../../FormStateProvider'
import Button from '../../simple-components/ButtonNew'
import { useFormModals } from '../../useFormModals'
import MessageModal, { MessageModalProps } from '../../widget-components/Modals/MessageModal'
import IdentityVerificationModal from '../IdentityVerificationModal/IdentityVerificationModal'
import RegistrationModal from '../RegistrationModal/RegistrationModal'

const FormModals = () => {
  const { t } = useTranslation('forms')
  const { skipModal } = useFormState()

  const {
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
    sendConfirmationLoading,
    sendConfirmationEidLoading,
  } = useFormModals()
  const { saveConcept, saveConceptIsLoading } = useFormExportImport()

  const messageModals: (MessageModalProps & { key: string })[] = [
    {
      key: 'oldVersionSchemaModal',
      isOpen: oldVersionSchemaModal,
      onOpenChange: setOldSchemaVersionModal,
      type: 'info',
      title: t('old_schema_version_modal.title'),
      buttons: [
        <Button variant="category-solid" onPress={() => setOldSchemaVersionModal(false)}>
          {t('old_schema_version_modal.button_title')}
        </Button>,
      ],
      children: t('old_schema_version_modal.content'),
    },
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
      children: t('skip_step_modal.content'),
    },
    {
      key: 'conceptSaveErrorModal',
      isOpen: conceptSaveErrorModal,
      onOpenChange: setConceptSaveErrorModal,
      type: 'error',
      title: t('concept_save_error_modal.title'),
      buttons: [
        <Button onPress={() => setConceptSaveErrorModal(false)}>
          {t('modals_back_button_title')}
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
      key: 'sendFilesScanningEidModal',
      isOpen: sendFilesScanningEidModal,
      onOpenChange: setSendFilesScanningEidModal,
      title: t('send_files_scanning_eid_modal.title'),
      type: 'warning',
      buttons: [
        <Button onPress={() => setSendFilesScanningEidModal(false)}>
          {t('modals_back_button_title')}
        </Button>,
        <Button variant="black-solid" onPress={() => skipModal.onSkip()}>
          {t('send_files_scanning_eid_modal.button_title')}
        </Button>,
      ],
      children: t('send_files_scanning_eid_modal.content'),
    },
    {
      key: 'sendFilesScanningNotVerifiedEidModal',
      isOpen: sendFilesScanningNotVerifiedEidModal,
      onOpenChange: setSendFilesScanningNotVerifiedEidModal,
      title: t('send_files_scanning_not_verified_eid_modal.title'),
      type: 'warning',
      buttons: [
        <Button onPress={() => setSendFilesScanningNotVerifiedEidModal(false)}>
          {t('modals_back_button_title')}
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
          {t('modals_back_button_title')}
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
          {t('modals_back_button_title')}
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
          {t('modals_back_button_title')}
        </Button>,
        <Button variant="black-solid" onPress={() => skipModal.onSkip()}>
          {t('send_files_uploading_modal.button_title')}
        </Button>,
      ],
      children: t('send_files_uploading_modal.content'),
    },
    {
      key: 'sendFilesScanningModal',
      isOpen: sendFilesScanningModal.isOpen,
      onOpenChange: (value) => {
        if (!value) {
          setSendFilesScanningModal({ isOpen: false })
        }
      },
      title: t('send_files_scanning_modal.title'),
      type: 'warning',
      buttons: [
        <Button onPress={() => setSendFilesScanningModal({ isOpen: false })}>
          {t('modals_back_button_title')}
        </Button>,
        <Button
          variant="black-solid"
          onPress={() => sendFilesScanningModal.isOpen && sendFilesScanningModal.sendCallback()}
          isLoading={sendConfirmationLoading}
        >
          {t('send_files_scanning_modal.button_title')}
        </Button>,
      ],
      children: t('send_files_scanning_modal.content'),
      isDismissable: !sendConfirmationLoading,
      noCloseButton: sendConfirmationLoading,
    },
    {
      key: 'sendConfirmationModal',
      isOpen: sendConfirmationModal.isOpen,
      onOpenChange: (value) => {
        if (!value) {
          setSendConfirmationModal({ isOpen: false })
        }
      },
      title: t('send_confirmation_modal.title'),
      type: 'info',
      buttons: [
        <Button
          onPress={() => setSendConfirmationModal({ isOpen: false })}
          isDisabled={sendConfirmationLoading}
        >
          {t('modals_back_button_title')}
        </Button>,
        <Button
          variant="black-solid"
          onPress={() => sendConfirmationModal.isOpen && sendConfirmationModal.sendCallback()}
          isLoading={sendConfirmationLoading}
        >
          {t('send_confirmation_modal.button_title')}
        </Button>,
      ],
      isDismissable: !sendConfirmationLoading,
      noCloseButton: sendConfirmationLoading,
      children: t('send_confirmation_modal.content'),
    },
    {
      key: 'sendConfirmationEidModal',
      isOpen: sendConfirmationEidModal.isOpen,
      onOpenChange: (value) => {
        if (!value) {
          setSendConfirmationEidModal({ isOpen: false })
        }
      },
      title: t('send_confirmation_eid_modal.title'),
      type: 'info',
      buttons: [
        <Button
          onPress={() => setSendConfirmationEidModal({ isOpen: false })}
          isDisabled={sendConfirmationEidLoading}
        >
          {t('modals_back_button_title')}
        </Button>,
        <Button
          variant="black-solid"
          onPress={() => sendConfirmationEidModal.isOpen && sendConfirmationEidModal.sendCallback()}
          isLoading={sendConfirmationEidLoading}
        >
          {t('send_confirmation_eid_modal.button_title')}
        </Button>,
      ],
      isDismissable: !sendConfirmationEidLoading,
      noCloseButton: sendConfirmationEidLoading,
      children: t('send_confirmation_eid_modal.content'),
    },
    {
      key: 'sendConfirmationEidLegalModal',
      isOpen: sendConfirmationEidLegalModal.isOpen,
      onOpenChange: (value) => {
        if (!value) {
          setSendConfirmationEidLegalModal({ isOpen: false })
        }
      },
      title: t('send_confirmation_eid_legal_modal.title'),
      type: 'info',
      buttons: [
        <Button
          onPress={() => setSendConfirmationEidLegalModal({ isOpen: false })}
          isDisabled={sendConfirmationEidLoading}
        >
          {t('modals_back_button_title')}
        </Button>,
        <Button
          variant="black-solid"
          onPress={() =>
            sendConfirmationEidLegalModal.isOpen && sendConfirmationEidLegalModal.sendCallback()
          }
          isLoading={sendConfirmationEidLoading}
        >
          {t('send_confirmation_eid_legal_modal.button_title')}
        </Button>,
      ],
      isDismissable: !sendConfirmationEidLoading,
      noCloseButton: sendConfirmationEidLoading,
      children: t('send_confirmation_eid_legal_modal.content'),
    },
    {
      key: 'sendConfirmationNonAuthenticatedEidModal',
      isOpen: sendConfirmationNonAuthenticatedEidModal.isOpen,
      onOpenChange: (value) => {
        if (!value) {
          setSendConfirmationNonAuthenticatedEidModal({ isOpen: false })
        }
      },
      title: t('send_confirmation_non_authenticated_eid_modal.title'),
      type: 'info',
      buttons: [
        <Button
          onPress={() => setSendConfirmationNonAuthenticatedEidModal({ isOpen: false })}
          isDisabled={sendConfirmationEidLoading}
        >
          {t('modals_back_button_title')}
        </Button>,
        <Button
          variant="black-solid"
          onPress={() =>
            sendConfirmationNonAuthenticatedEidModal.isOpen &&
            sendConfirmationNonAuthenticatedEidModal.sendCallback()
          }
          isLoading={sendConfirmationEidLoading}
        >
          {t('send_confirmation_non_authenticated_eid_modal.button_title')}
        </Button>,
      ],
      isDismissable: !sendConfirmationEidLoading,
      noCloseButton: sendConfirmationEidLoading,
      children: t('send_confirmation_non_authenticated_eid_modal.content'),
    },
  ]

  const { accountType } = useServerSideAuth()

  return (
    <>
      <RegistrationModal
        type={registrationModal}
        isOpen={registrationModal != null}
        onOpenChange={(value) => {
          if (value) {
            setRegistrationModal(null)
          }
        }}
      />
      <IdentityVerificationModal
        isOpen={identityVerificationModal}
        onOpenChange={setIdentityVerificationModal}
        accountType={accountType}
      />
      {messageModals.map((modalProps) => (
        <MessageModal {...modalProps} />
      ))}
    </>
  )
}

export default FormModals
