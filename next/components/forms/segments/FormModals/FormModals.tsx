import { useTranslation } from 'next-i18next'
import React from 'react'

import Button from '@/components/forms/simple-components/Button'
import MessageModal, {
  MessageModalProps,
} from '@/components/forms/widget-components/Modals/MessageModal'
import { useFormExportImport } from '@/frontend/hooks/useFormExportImport'
import { useSsrAuth } from '@/frontend/hooks/useSsrAuth'

import { useFormModals } from '../../useFormModals'
import { useFormRedirects } from '../../useFormRedirects'
import AccountMarkdown from '../AccountMarkdown/AccountMarkdown'
import IdentityVerificationModal from '../IdentityVerificationModal/IdentityVerificationModal'
import RegistrationModal from '../RegistrationModal/RegistrationModal'
import TaxFormPdfExportModal from '../TaxFormPdfExportModal/TaxFormPdfExportModal'

const FormModals = () => {
  const { t } = useTranslation('forms')

  const {
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
    sendPending,
    eidSendingModal,
    setEidSendingModal,
    eidSendErrorModal,
    setEidSendErrorModal,
    sendEidPending,
    eidSendConfirmationModalIsPending,
    deleteConceptModal,
    setDeleteConceptModal,
    taxFormPdfExportModal,
    setTaxFormPdfExportModal,
    signerIsDeploying,
    setSignerIsDeploying,
    xmlImportVersionConfirmationModal,
    setXmlImportVersionConfirmationModal,
  } = useFormModals()
  const { saveConcept, saveConceptIsPending, migrateForm, migrateFormIsPending } =
    useFormExportImport()
  const { login, register, verifyIdentity } = useFormRedirects()

  const messageModals: (MessageModalProps & { key: string })[] = [
    {
      key: 'migrationRequiredModal',
      isOpen: migrationRequiredModal,
      onOpenChange: setMigrationRequiredModal,
      type: 'warning',
      title: t('migration_required_modal.title'),
      buttons: [
        <Button onPress={() => setMigrationRequiredModal(false)} fullWidthMobile>
          {t('migration_required_modal.button_discard')}
        </Button>,
        <Button
          variant="solid"
          size="small"
          onPress={() => migrateForm()}
          fullWidthMobile
          isLoading={migrateFormIsPending}
          isLoadingText={t('migration_required_modal.button_title_loading')}
        >
          {t('migration_required_modal.button_title')}
        </Button>,
      ],
      children: t('migration_required_modal.content'),
    },
    {
      key: 'conceptSaveErrorModal',
      isOpen: conceptSaveErrorModal,
      onOpenChange: setConceptSaveErrorModal,
      type: 'error',
      title: t('concept_save_error_modal.title'),
      buttons: [
        <Button variant="plain" onPress={() => setConceptSaveErrorModal(false)}>
          {t('modal.close_button_label')}
        </Button>,
        <Button
          variant="negative-solid"
          size="small"
          onPress={() => saveConcept(true)}
          isLoading={saveConceptIsPending}
          isLoadingText={t('concept_save_error_modal.button_title_loading')}
        >
          {t('concept_save_error_modal.button_title')}
        </Button>,
      ],
      children: t('concept_save_error_modal.content'),
    },
    {
      key: 'sendIdentityMissingModal',
      isOpen: sendIdentityMissingModal,
      onOpenChange: setSendIdentityMissingModal,
      title: t('send_identity_missing_modal.title'),
      type: 'warning',
      buttons: [
        <Button variant="plain" onPress={() => setSendIdentityMissingModal(false)} fullWidthMobile>
          {t('modal.close_button_label')}
        </Button>,
        <Button variant="solid" size="small" onPress={() => verifyIdentity()} fullWidthMobile>
          {t('send_identity_missing_modal.button_title')}
        </Button>,
      ],
      children: t('send_identity_missing_modal.content'),
    },
    {
      key: 'sendFilesUploadingModal',
      isOpen: sendFilesUploadingModal,
      onOpenChange: setSendFilesUploadingModal,
      title: t('send_files_uploading_modal.title'),
      type: 'warning',
      buttons: [
        <Button variant="plain" onPress={() => setSendFilesUploadingModal(false)}>
          {t('modal.close_button_label')}
        </Button>,
      ],
      children: t('send_files_uploading_modal.content'),
    },
    {
      key: 'sendFilesScanningModal',
      isOpen: sendFilesScanningModal,
      onOpenChange: setSendFilesScanningModal,
      title: t('send_files_scanning_modal.title'),
      type: 'warning',
      buttons: [
        <Button variant="plain" onPress={() => setSendFilesScanningModal(false)}>
          {t('modal.close_button_label')}
        </Button>,
      ],
      children: t('send_files_scanning_modal.content'),
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
          variant="plain"
          onPress={() => setSendConfirmationModal({ isOpen: false })}
          fullWidthMobile
          isDisabled={sendPending}
        >
          {t('modal.close_button_label')}
        </Button>,
        <Button
          variant="solid"
          size="small"
          onPress={() => sendConfirmationModal.isOpen && sendConfirmationModal.confirmCallback()}
          fullWidthMobile
          isLoading={sendPending}
          isLoadingText={t('send_confirmation_modal.button_title_loading')}
        >
          {t('send_confirmation_modal.button_title')}
        </Button>,
      ],
      isDismissable: !sendPending,
      noCloseButton: sendPending,
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
          variant="plain"
          onPress={() => setSendConfirmationEidModal({ isOpen: false })}
          isDisabled={eidSendConfirmationModalIsPending}
          fullWidthMobile
        >
          {t('modal.close_button_label')}
        </Button>,
        <Button
          variant="solid"
          size="small"
          onPress={() =>
            sendConfirmationEidModal.isOpen && sendConfirmationEidModal.confirmCallback()
          }
          fullWidthMobile
          isLoading={eidSendConfirmationModalIsPending}
          isLoadingText={t('send_confirmation_eid_modal.button_title_loading')}
        >
          {t('send_confirmation_eid_modal.button_title')}
        </Button>,
      ],
      isDismissable: !eidSendConfirmationModalIsPending,
      noCloseButton: eidSendConfirmationModalIsPending,
      children: (
        <>
          {t('send_confirmation_eid_modal.content')}
          <div className="text-p3">{t('send_confirmation_eid_modal.content_small')}</div>
        </>
      ),
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
          variant="plain"
          onPress={() => setSendConfirmationEidLegalModal({ isOpen: false })}
          isDisabled={eidSendConfirmationModalIsPending}
          fullWidthMobile
        >
          {t('modal.close_button_label')}
        </Button>,
        <Button
          variant="solid"
          size="small"
          onPress={() =>
            sendConfirmationEidLegalModal.isOpen && sendConfirmationEidLegalModal.confirmCallback()
          }
          isLoading={eidSendConfirmationModalIsPending}
          isLoadingText={t('send_confirmation_eid_legal_modal.button_title_loading')}
          fullWidthMobile
        >
          {t('send_confirmation_eid_legal_modal.button_title')}
        </Button>,
      ],
      isDismissable: !eidSendConfirmationModalIsPending,
      noCloseButton: eidSendConfirmationModalIsPending,
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
          variant="plain"
          onPress={() => setSendConfirmationNonAuthenticatedEidModal({ isOpen: false })}
          fullWidthMobile
          isDisabled={eidSendConfirmationModalIsPending}
        >
          {t('modal.close_button_label')}
        </Button>,
        <Button
          variant="solid"
          size="small"
          onPress={() =>
            sendConfirmationNonAuthenticatedEidModal.isOpen &&
            sendConfirmationNonAuthenticatedEidModal.confirmCallback()
          }
          fullWidthMobile
          isLoading={eidSendConfirmationModalIsPending}
          isLoadingText={t('send_confirmation_non_authenticated_eid_modal.button_title_loading')}
        >
          {t('send_confirmation_non_authenticated_eid_modal.button_title')}
        </Button>,
      ],
      isDismissable: !eidSendConfirmationModalIsPending,
      noCloseButton: eidSendConfirmationModalIsPending,
      children: t('send_confirmation_non_authenticated_eid_modal.content'),
    },
    {
      key: 'eidSendingModal',
      isOpen: eidSendingModal,
      onOpenChange: setEidSendingModal,
      title: t('eid_sending_modal.title'),
      type: 'info',
      buttons: [
        // Faux button that show only is loading
        <Button isLoading={sendEidPending} onPress={() => {}} />,
      ],
      isDismissable: false,
      noCloseButton: true,
      children: t('eid_sending_modal.content'),
    },
    {
      key: 'eidSendErrorModal',
      isOpen: eidSendErrorModal.isOpen,
      onOpenChange: (value) => {
        if (!value) {
          setEidSendErrorModal({ isOpen: false })
        }
      },
      title: t('eid_send_error_modal.title'),
      type: 'info',
      buttons: [
        <Button
          variant="solid"
          onPress={() => setEidSendErrorModal({ isOpen: false })}
          isDisabled={sendEidPending}
          fullWidthMobile
        >
          {t('modal.close_button_label')}
        </Button>,
      ],
      isDismissable: !sendEidPending,
      noCloseButton: sendEidPending,
      children: t('eid_send_error_modal.content'),
    },
    {
      key: 'deleteConceptModal',
      isOpen: deleteConceptModal.isOpen,
      onOpenChange: (value) => {
        if (!value) {
          setDeleteConceptModal({ isOpen: false })
        }
      },
      title: t('concept_delete_modal.title'),
      type: 'error',
      buttons: [
        <Button variant="plain" onPress={() => setDeleteConceptModal({ isOpen: false })}>
          {t('modal.close_button_label')}
        </Button>,
        <Button
          variant="negative-solid"
          size="small"
          onPress={() => deleteConceptModal.isOpen && deleteConceptModal.confirmCallback()}
        >
          {t('concept_delete_modal.button_title')}
        </Button>,
      ],
      isDismissable: false,
      noCloseButton: true,
      children: t('concept_delete_modal.content'),
    },
    {
      key: 'signerIsDeploying',
      isOpen: signerIsDeploying,
      onOpenChange: setSignerIsDeploying,
      type: 'info',
      title: t('signer_deploying_modal.title'),
      children: (
        // TODO Replace statusBar variant
        <AccountMarkdown variant="statusBar" content={t('signer_deploying_modal.content')} />
      ),
    },
    {
      key: 'xmlImportVersionConfirmationModal',
      isOpen: xmlImportVersionConfirmationModal.isOpen,
      onOpenChange: (value) => {
        if (!value) {
          setXmlImportVersionConfirmationModal({ isOpen: false })
        }
      },
      title: t('xml_import_version_confirmation_modal.title'),
      type: 'warning',
      buttons: [
        <Button
          variant="plain"
          onPress={() => setXmlImportVersionConfirmationModal({ isOpen: false })}
          fullWidthMobile
        >
          {t('xml_import_version_confirmation_modal.button_cancel')}
        </Button>,
        <Button
          variant="solid"
          size="small"
          onPress={() =>
            xmlImportVersionConfirmationModal.isOpen &&
            xmlImportVersionConfirmationModal.confirmCallback()
          }
          fullWidthMobile
        >
          {t('xml_import_version_confirmation_modal.button_title')}
        </Button>,
      ],
      children: t('xml_import_version_confirmation_modal.content'),
    },
  ]

  const { accountType } = useSsrAuth()

  return (
    <>
      <RegistrationModal
        type={registrationModal}
        isOpen={registrationModal != null}
        onOpenChange={(value) => {
          if (!value) {
            setRegistrationModal(null)
          }
        }}
        login={login}
        register={register}
      />
      <TaxFormPdfExportModal
        state={taxFormPdfExportModal}
        isOpen={taxFormPdfExportModal != null}
        onOpenChange={(value) => {
          if (!value) {
            setTaxFormPdfExportModal(null)
          }
        }}
      />
      <IdentityVerificationModal
        isOpen={identityVerificationModal}
        onOpenChange={setIdentityVerificationModal}
        accountType={accountType}
      />
      {messageModals.map((modalProps) => {
        // To avoid "A props object containing a "key" prop is being spread into JSX" error
        const { key, ...restModalProps } = modalProps
        return <MessageModal key={key} {...restModalProps} />
      })}
    </>
  )
}

export default FormModals
