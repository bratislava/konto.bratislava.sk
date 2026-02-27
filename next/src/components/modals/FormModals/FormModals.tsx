/* eslint-disable sonarjs/no-duplicate-string */
import { useTranslation } from 'next-i18next'
import React from 'react'

import AccountMarkdown from '@/src/components/formatting/AccountMarkdown'
import { useFormRedirects } from '@/src/components/forms/useFormRedirects'
import { useFormModals } from '@/src/components/modals/FormModals/useFormModals'
import IdentityVerificationModal from '@/src/components/modals/IdentityVerificationModal'
import RegistrationModal from '@/src/components/modals/RegistrationModal'
import TaxFormPdfExportModal from '@/src/components/modals/TaxFormPdfExportModal/TaxFormPdfExportModal'
import Button from '@/src/components/simple-components/Button'
import MessageModal, {
  MessageModalProps,
} from '@/src/components/widget-components/Modals/MessageModal'
import { useFormExportImport } from '@/src/frontend/hooks/useFormExportImport'
import { useSsrAuth } from '@/src/frontend/hooks/useSsrAuth'

export const formMessageModalsKeys = [
  'migrationRequiredModal',
  'conceptSaveErrorModal',
  'sendIdentityMissingModal',
  'sendFilesUploadingModal',
  'sendFilesScanningModal',
  'sendConfirmationModal',
  'sendConfirmationEidModal',
  'sendConfirmationEidLegalModal',
  'sendConfirmationNonAuthenticatedEidModal',
  'eidSendingModal',
  'eidSendErrorModal',
  'deleteConceptModal',
  'signerIsDeploying',
  'xmlImportVersionConfirmationModal',
] as const
export type FormMessageModalsKeys = (typeof formMessageModalsKeys)[number]

export const FormMessageModals = () => {
  const { t } = useTranslation('forms')

  const {
    migrationRequiredModal,
    setMigrationRequiredModal,
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
    signerIsDeploying,
    setSignerIsDeploying,
    xmlImportVersionConfirmationModal,
    setXmlImportVersionConfirmationModal,
  } = useFormModals()
  const { saveConcept, saveConceptIsPending, migrateForm, migrateFormIsPending } =
    useFormExportImport()
  const { verifyIdentity } = useFormRedirects()

  const messageModals: (MessageModalProps & { key: FormMessageModalsKeys })[] = [
    {
      key: 'migrationRequiredModal',
      isOpen: migrationRequiredModal,
      onOpenChange: setMigrationRequiredModal,
      type: 'warning',
      title: t('migration_required_modal.title'),
      primaryButton: (
        <Button
          variant="solid"
          onPress={() => migrateForm()}
          isLoading={migrateFormIsPending}
          loadingText={t('migration_required_modal.button_title_loading')}
        >
          {t('migration_required_modal.button_title')}
        </Button>
      ),
      secondaryButton: (
        <Button variant="outline-soft" onPress={() => setMigrationRequiredModal(false)}>
          {t('migration_required_modal.button_discard')}
        </Button>
      ),
      children: t('migration_required_modal.content'),
    },
    {
      key: 'conceptSaveErrorModal',
      isOpen: conceptSaveErrorModal,
      onOpenChange: setConceptSaveErrorModal,
      type: 'error',
      title: t('concept_save_error_modal.title'),
      primaryButton: (
        <Button
          variant="negative-solid"
          onPress={() => saveConcept(true)}
          isLoading={saveConceptIsPending}
          loadingText={t('concept_save_error_modal.button_title_loading')}
        >
          {t('concept_save_error_modal.button_title')}
        </Button>
      ),
      secondaryButton: (
        <Button variant="outline-soft" onPress={() => setConceptSaveErrorModal(false)}>
          {t('modal.close_button_label')}
        </Button>
      ),
      children: t('concept_save_error_modal.content'),
    },
    {
      key: 'sendIdentityMissingModal',
      isOpen: sendIdentityMissingModal,
      onOpenChange: setSendIdentityMissingModal,
      title: t('send_identity_missing_modal.title'),
      type: 'warning',
      primaryButton: (
        <Button variant="solid" onPress={() => verifyIdentity()}>
          {t('send_identity_missing_modal.button_title')}
        </Button>
      ),
      secondaryButton: (
        <Button variant="outline-soft" onPress={() => setSendIdentityMissingModal(false)}>
          {t('modal.close_button_label')}
        </Button>
      ),
      children: t('send_identity_missing_modal.content'),
    },
    {
      key: 'sendFilesUploadingModal',
      isOpen: sendFilesUploadingModal,
      onOpenChange: setSendFilesUploadingModal,
      title: t('send_files_uploading_modal.title'),
      type: 'warning',
      primaryButton: (
        <Button variant="solid" onPress={() => setSendFilesUploadingModal(false)}>
          {t('modal.close_button_label')}
        </Button>
      ),
      children: t('send_files_uploading_modal.content'),
    },
    {
      key: 'sendFilesScanningModal',
      isOpen: sendFilesScanningModal,
      onOpenChange: setSendFilesScanningModal,
      title: t('send_files_scanning_modal.title'),
      type: 'warning',
      primaryButton: (
        <Button variant="solid" onPress={() => setSendFilesScanningModal(false)}>
          {t('modal.close_button_label')}
        </Button>
      ),
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
      primaryButton: (
        <Button
          variant="solid"
          onPress={() => sendConfirmationModal.isOpen && sendConfirmationModal.confirmCallback()}
          isLoading={sendPending}
          loadingText={t('send_confirmation_modal.button_title_loading')}
        >
          {t('send_confirmation_modal.button_title')}
        </Button>
      ),
      secondaryButton: (
        <Button
          variant="outline-soft"
          onPress={() => setSendConfirmationModal({ isOpen: false })}
          isDisabled={sendPending}
        >
          {t('modal.close_button_label')}
        </Button>
      ),
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
      primaryButton: (
        <Button
          variant="solid"
          onPress={() =>
            sendConfirmationEidModal.isOpen && sendConfirmationEidModal.confirmCallback()
          }
          isLoading={eidSendConfirmationModalIsPending}
          loadingText={t('send_confirmation_eid_modal.button_title_loading')}
        >
          {t('send_confirmation_eid_modal.button_title')}
        </Button>
      ),
      secondaryButton: (
        <Button
          variant="outline-soft"
          onPress={() => setSendConfirmationEidModal({ isOpen: false })}
          isDisabled={eidSendConfirmationModalIsPending}
        >
          {t('modal.close_button_label')}
        </Button>
      ),
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
      primaryButton: (
        <Button
          variant="solid"
          onPress={() =>
            sendConfirmationEidLegalModal.isOpen && sendConfirmationEidLegalModal.confirmCallback()
          }
          isLoading={eidSendConfirmationModalIsPending}
          loadingText={t('send_confirmation_eid_legal_modal.button_title_loading')}
        >
          {t('send_confirmation_eid_legal_modal.button_title')}
        </Button>
      ),
      secondaryButton: (
        <Button
          variant="outline-soft"
          onPress={() => setSendConfirmationEidLegalModal({ isOpen: false })}
          isDisabled={eidSendConfirmationModalIsPending}
        >
          {t('modal.close_button_label')}
        </Button>
      ),
      isDismissable: !eidSendConfirmationModalIsPending,
      noCloseButton: eidSendConfirmationModalIsPending,
      children: (
        <>
          {t('send_confirmation_eid_legal_modal.content')}
          <div className="text-p3">{t('send_confirmation_eid_legal_modal.content_small')}</div>
        </>
      ),
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
      primaryButton: (
        <Button
          variant="solid"
          onPress={() =>
            sendConfirmationNonAuthenticatedEidModal.isOpen &&
            sendConfirmationNonAuthenticatedEidModal.confirmCallback()
          }
          isLoading={eidSendConfirmationModalIsPending}
          loadingText={t('send_confirmation_non_authenticated_eid_modal.button_title_loading')}
        >
          {t('send_confirmation_non_authenticated_eid_modal.button_title')}
        </Button>
      ),
      secondaryButton: (
        <Button
          variant="outline-soft"
          onPress={() => setSendConfirmationNonAuthenticatedEidModal({ isOpen: false })}
          isDisabled={eidSendConfirmationModalIsPending}
        >
          {t('modal.close_button_label')}
        </Button>
      ),
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
      primaryButton: (
        // Faux button that shows only is loading
        <Button variant="solid" size="small" isLoading onPress={() => {}} className="w-fit" />
      ),
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
      primaryButton: (
        <Button
          variant="solid"
          onPress={() => setEidSendErrorModal({ isOpen: false })}
          isDisabled={sendEidPending}
        >
          {t('modal.close_button_label')}
        </Button>
      ),
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
      primaryButton: (
        <Button
          variant="negative-solid"
          onPress={() => deleteConceptModal.isOpen && deleteConceptModal.confirmCallback()}
        >
          {t('concept_delete_modal.button_title')}
        </Button>
      ),
      secondaryButton: (
        <Button variant="outline-soft" onPress={() => setDeleteConceptModal({ isOpen: false })}>
          {t('modal.close_button_label')}
        </Button>
      ),
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
      primaryButton: (
        <Button
          variant="solid"
          onPress={() =>
            xmlImportVersionConfirmationModal.isOpen &&
            xmlImportVersionConfirmationModal.confirmCallback()
          }
        >
          {t('xml_import_version_confirmation_modal.button_title')}
        </Button>
      ),
      children: t('xml_import_version_confirmation_modal.content'),
    },
  ]

  return (
    <>
      {messageModals.map((modalProps) => {
        // To avoid "A props object containing a "key" prop is being spread into JSX" error
        const { key, ...restModalProps } = modalProps
        return <MessageModal key={key} {...restModalProps} />
      })}
    </>
  )
}

const FormModals = () => {
  const {
    registrationModal,
    setRegistrationModal,
    taxFormPdfExportModal,
    setTaxFormPdfExportModal,
    identityVerificationModal,
    setIdentityVerificationModal,
  } = useFormModals()
  const { accountType } = useSsrAuth()
  const { login, register } = useFormRedirects()

  return (
    <>
      <FormMessageModals />
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
    </>
  )
}
export default FormModals
