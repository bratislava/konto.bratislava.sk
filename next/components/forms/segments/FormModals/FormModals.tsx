import { getUiOptions } from '@rjsf/utils'
import { useFormData } from 'components/forms/useFormData'
import { getFormTitle } from 'frontend/utils/general'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { useFormExportImport } from '../../../../frontend/hooks/useFormExportImport'
import { useSsrAuth } from '../../../../frontend/hooks/useSsrAuth'
import Button from '../../simple-components/ButtonNew'
import { useFormContext } from '../../useFormContext'
import { useFormModals } from '../../useFormModals'
import { useFormRedirects } from '../../useFormRedirects'
import MessageModal, { MessageModalProps } from '../../widget-components/Modals/MessageModal'
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
  } = useFormModals()
  const { saveConcept, saveConceptIsPending, migrateForm, migrateFormIsPending } =
    useFormExportImport()
  const { login, register, verifyIdentity } = useFormRedirects()

  const {
    formDefinition: { schema },
  } = useFormContext()
  const { formData } = useFormData()
  const uiOptions = getUiOptions(schema.baUiSchema)
  const title = getFormTitle(formData, uiOptions, t('form_title_fallback'))

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
          variant="black-solid"
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
        <Button variant="black-plain" onPress={() => setConceptSaveErrorModal(false)}>
          {t('modals_back_button_title')}
        </Button>,
        <Button
          variant="category-solid"
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
      key: 'sendFilesScanningEidModal',
      isOpen: sendFilesScanningEidModal.isOpen,
      onOpenChange: (value) => {
        if (!value) {
          setSendFilesScanningEidModal({ isOpen: false })
        }
      },
      title: t('send_files_scanning_eid_modal.title'),
      type: 'warning',
      buttons: [
        <Button
          variant="black-plain"
          onPress={() => setSendFilesScanningEidModal({ isOpen: false })}
          fullWidthMobile
        >
          {t('modals_back_button_title')}
        </Button>,
        <Button
          variant="black-solid"
          size="small"
          onPress={() =>
            sendFilesScanningEidModal.isOpen && sendFilesScanningEidModal.sendCallback()
          }
          fullWidthMobile
          isLoading={sendPending}
          isLoadingText={t('send_files_scanning_eid_modal.button_title_loading')}
        >
          {t('send_files_scanning_eid_modal.button_title')}
        </Button>,
      ],
      isDismissable: !sendPending,
      noCloseButton: sendPending,
      children: t('send_files_scanning_eid_modal.content'),
    },
    {
      key: 'sendFilesScanningNotVerifiedEidModal',
      isOpen: sendFilesScanningNotVerifiedEidModal,
      onOpenChange: setSendFilesScanningNotVerifiedEidModal,
      title: t('send_files_scanning_not_verified_eid_modal.title'),
      type: 'warning',
      buttons: [
        <Button
          variant="black-plain"
          onPress={() => setSendFilesScanningNotVerifiedEidModal(false)}
          fullWidthMobile
        >
          {t('modals_back_button_title')}
        </Button>,
        <Button variant="black-solid" size="small" onPress={() => verifyIdentity()} fullWidthMobile>
          {t('send_files_scanning_not_verified_eid_modal.button_title')}
        </Button>,
      ],
      children: t('send_files_scanning_not_verified_eid_modal.content'),
    },
    {
      key: 'sendFilesScanningNotVerified',
      isOpen: sendFilesScanningNotVerified.isOpen,
      onOpenChange: (value) => {
        if (!value) {
          setSendFilesScanningNotVerified({ isOpen: false })
        }
      },
      title: t('send_files_scanning_not_verified.title'),
      type: 'warning',
      buttons: [
        <Button
          className="grow"
          variant="black-solid"
          size="small"
          onPress={() => verifyIdentity()}
          fullWidthMobile
        >
          {t('send_files_scanning_not_verified.button_title')}
        </Button>,
        <Button
          className="grow"
          variant="black-outline"
          size="small"
          onPress={() =>
            sendFilesScanningNotVerified.isOpen && sendFilesScanningNotVerified.sendCallback()
          }
          fullWidthMobile
        >
          {t('send_files_scanning_not_verified.button_title_eid')}
        </Button>,
      ],
      variant: 'vertical',
      children: (
        <>
          {t('send_files_scanning_not_verified.content')}
          <AccountMarkdown
            className="text-p3"
            variant="sm"
            content={t('send_files_scanning_not_verified.content_small')}
          />
        </>
      ),
      childrenClassName: 'md:text-center',
    },
    {
      key: 'sendIdentityMissingModal',
      isOpen: sendIdentityMissingModal,
      onOpenChange: setSendIdentityMissingModal,
      title: t('send_identity_missing_modal.title'),
      type: 'warning',
      buttons: [
        <Button
          variant="black-plain"
          onPress={() => setSendIdentityMissingModal(false)}
          fullWidthMobile
        >
          {t('modals_back_button_title')}
        </Button>,
        <Button variant="black-solid" size="small" onPress={() => verifyIdentity()} fullWidthMobile>
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
        <Button
          variant="black-plain"
          onPress={() => setSendFilesScanningNonAuthenticatedEidModal(false)}
          fullWidthMobile
        >
          {t('modals_back_button_title')}
        </Button>,
        <Button variant="black-solid" size="small" onPress={() => register()} fullWidthMobile>
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
        <Button
          variant="black-plain"
          onPress={() => setSendFilesScanningModal({ isOpen: false })}
          fullWidthMobile
        >
          {t('modals_back_button_title')}
        </Button>,
        <Button
          variant="black-solid"
          size="small"
          onPress={() => sendFilesScanningModal.isOpen && sendFilesScanningModal.sendCallback()}
          fullWidthMobile
          isLoading={sendPending}
          isLoadingText={t('send_files_scanning_modal.button_title_loading')}
        >
          {t('send_files_scanning_modal.button_title')}
        </Button>,
      ],
      children: t('send_files_scanning_modal.content'),
      isDismissable: !sendPending,
      noCloseButton: sendPending,
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
          variant="black-plain"
          onPress={() => setSendConfirmationModal({ isOpen: false })}
          fullWidthMobile
          isDisabled={sendPending}
        >
          {t('modals_back_button_title')}
        </Button>,
        <Button
          variant="black-solid"
          size="small"
          onPress={() => sendConfirmationModal.isOpen && sendConfirmationModal.sendCallback()}
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
          variant="black-plain"
          onPress={() => setSendConfirmationEidModal({ isOpen: false })}
          isDisabled={eidSendConfirmationModalIsPending}
          fullWidthMobile
        >
          {t('modals_back_button_title')}
        </Button>,
        <Button
          variant="black-solid"
          size="small"
          onPress={() => sendConfirmationEidModal.isOpen && sendConfirmationEidModal.sendCallback()}
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
          variant="black-plain"
          onPress={() => setSendConfirmationEidLegalModal({ isOpen: false })}
          isDisabled={eidSendConfirmationModalIsPending}
          fullWidthMobile
        >
          {t('modals_back_button_title')}
        </Button>,
        <Button
          variant="black-solid"
          size="small"
          onPress={() =>
            sendConfirmationEidLegalModal.isOpen && sendConfirmationEidLegalModal.sendCallback()
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
          variant="black-plain"
          onPress={() => setSendConfirmationNonAuthenticatedEidModal({ isOpen: false })}
          fullWidthMobile
          isDisabled={eidSendConfirmationModalIsPending}
        >
          {t('modals_back_button_title')}
        </Button>,
        <Button
          variant="black-solid"
          size="small"
          onPress={() =>
            sendConfirmationNonAuthenticatedEidModal.isOpen &&
            sendConfirmationNonAuthenticatedEidModal.sendCallback()
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
          variant="black-solid"
          onPress={() => setEidSendErrorModal({ isOpen: false })}
          isDisabled={sendEidPending}
          fullWidthMobile
        >
          {t('modals_back_button_title')}
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
        <Button variant="black-plain" onPress={() => setDeleteConceptModal({ isOpen: false })}>
          {t('modals_back_button_title')}
        </Button>,
        <Button
          variant="negative-solid"
          size="small"
          onPress={() => deleteConceptModal.isOpen && deleteConceptModal.sendCallback()}
        >
          {t('concept_delete_modal.button_title')}
        </Button>,
      ],
      isDismissable: false,
      noCloseButton: true,
      children: t('concept_delete_modal.content', { conceptName: title }),
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
