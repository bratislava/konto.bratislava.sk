import { Button, Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'

import Markdown from '@/src/components/formatting/Markdown'
import { useFormRedirects } from '@/src/components/forms/useFormRedirects'
import { useFormModals } from '@/src/components/modals/FormModals/useFormModals'
import IdentityVerificationModal from '@/src/components/modals/IdentityVerificationModal'
import RegistrationModal from '@/src/components/modals/RegistrationModal'
import TaxFormPdfExportModal from '@/src/components/modals/TaxFormPdfExportModal/TaxFormPdfExportModal'
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

/**
 * Figma: https://www.figma.com/design/0VrrvwWs7n3T8YFzoHe92X/BK--Dizajn--DEV-?node-id=10982-771&p=f
 */

export const FormMessageModals = () => {
  const { t } = useTranslation()

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
      title: t('FormModals.migrationRequiredModal.title'),
      primaryButton: (
        <Button
          variant="solid"
          size="small"
          onPress={() => migrateForm()}
          isLoading={migrateFormIsPending}
          loadingText={t('FormModals.migrationRequiredModal.buttonTitleLoading')}
        >
          {t('FormModals.migrationRequiredModal.buttonTitle')}
        </Button>
      ),
      secondaryButton: (
        <Button
          variant="outline-soft"
          size="small"
          onPress={() => setMigrationRequiredModal(false)}
        >
          {t('FormModals.migrationRequiredModal.buttonDiscard')}
        </Button>
      ),
      children: t('FormModals.migrationRequiredModal.content'),
    },
    {
      key: 'conceptSaveErrorModal',
      isOpen: conceptSaveErrorModal,
      onOpenChange: setConceptSaveErrorModal,
      type: 'error',
      title: t('FormModals.conceptSaveErrorModal.title'),
      primaryButton: (
        <Button
          variant="negative-solid"
          size="small"
          onPress={() => saveConcept(true)}
          isLoading={saveConceptIsPending}
          loadingText={t('FormModals.conceptSaveErrorModal.buttonTitleLoading')}
        >
          {t('FormModals.conceptSaveErrorModal.buttonTitle')}
        </Button>
      ),
      secondaryButton: (
        <Button variant="outline-soft" size="small" onPress={() => setConceptSaveErrorModal(false)}>
          {t('FormModals.closeButton')}
        </Button>
      ),
      children: t('FormModals.conceptSaveErrorModal.content'),
    },
    {
      key: 'sendIdentityMissingModal',
      isOpen: sendIdentityMissingModal,
      onOpenChange: setSendIdentityMissingModal,
      title: t('FormModals.sendIdentityMissingModal.title'),
      type: 'warning',
      primaryButton: (
        <Button variant="solid" size="small" onPress={() => verifyIdentity()}>
          {t('FormModals.sendIdentityMissingModal.buttonTitle')}
        </Button>
      ),
      secondaryButton: (
        <Button
          variant="outline-soft"
          size="small"
          onPress={() => setSendIdentityMissingModal(false)}
        >
          {t('FormModals.closeButton')}
        </Button>
      ),
      children: t('FormModals.sendIdentityMissingModal.content'),
    },
    {
      key: 'sendFilesUploadingModal',
      isOpen: sendFilesUploadingModal,
      onOpenChange: setSendFilesUploadingModal,
      title: t('FormModals.sendFilesUploadingModal.title'),
      type: 'warning',
      primaryButton: (
        <Button variant="solid" size="small" onPress={() => setSendFilesUploadingModal(false)}>
          {t('FormModals.closeButton')}
        </Button>
      ),
      children: t('FormModals.sendFilesUploadingModal.content'),
    },
    {
      key: 'sendFilesScanningModal',
      isOpen: sendFilesScanningModal,
      onOpenChange: setSendFilesScanningModal,
      title: t('FormModals.sendFilesScanningModal.title'),
      type: 'warning',
      primaryButton: (
        <Button variant="solid" size="small" onPress={() => setSendFilesScanningModal(false)}>
          {t('FormModals.closeButton')}
        </Button>
      ),
      children: t('FormModals.sendFilesScanningModal.content'),
    },
    {
      key: 'sendConfirmationModal',
      isOpen: sendConfirmationModal.isOpen,
      onOpenChange: (value) => {
        if (!value) {
          setSendConfirmationModal({ isOpen: false })
        }
      },
      title: t('FormModals.sendConfirmationModal.title'),
      type: 'info',
      primaryButton: (
        <Button
          variant="solid"
          size="small"
          onPress={() => sendConfirmationModal.isOpen && sendConfirmationModal.confirmCallback()}
          isLoading={sendPending}
          loadingText={t('FormModals.sendConfirmationModal.buttonTitleLoading')}
        >
          {t('FormModals.sendConfirmationModal.buttonTitle')}
        </Button>
      ),
      secondaryButton: (
        <Button
          variant="outline-soft"
          size="small"
          onPress={() => setSendConfirmationModal({ isOpen: false })}
          isDisabled={sendPending}
        >
          {t('FormModals.closeButton')}
        </Button>
      ),
      isDismissable: !sendPending,
      noCloseButton: sendPending,
      children: t('FormModals.sendConfirmationModal.content'),
    },
    {
      key: 'sendConfirmationEidModal',
      isOpen: sendConfirmationEidModal.isOpen,
      onOpenChange: (value) => {
        if (!value) {
          setSendConfirmationEidModal({ isOpen: false })
        }
      },
      title: t('FormModals.sendConfirmationEidModal.title'),
      type: 'info',
      primaryButton: (
        <Button
          variant="solid"
          size="small"
          onPress={() =>
            sendConfirmationEidModal.isOpen && sendConfirmationEidModal.confirmCallback()
          }
          isLoading={eidSendConfirmationModalIsPending}
          loadingText={t('FormModals.sendConfirmationEidModal.buttonTitleLoading')}
        >
          {t('FormModals.sendConfirmationEidModal.buttonTitle')}
        </Button>
      ),
      secondaryButton: (
        <Button
          variant="outline-soft"
          size="small"
          onPress={() => setSendConfirmationEidModal({ isOpen: false })}
          isDisabled={eidSendConfirmationModalIsPending}
        >
          {t('FormModals.closeButton')}
        </Button>
      ),
      isDismissable: !eidSendConfirmationModalIsPending,
      noCloseButton: eidSendConfirmationModalIsPending,
      children: (
        <>
          {t('FormModals.sendConfirmationEidModal.content')}
          <Typography variant="p-small">
            {t('FormModals.sendConfirmationEidModal.contentSmall')}
          </Typography>
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
      title: t('FormModals.sendConfirmationEidLegalModal.title'),
      type: 'info',
      primaryButton: (
        <Button
          variant="solid"
          size="small"
          onPress={() =>
            sendConfirmationEidLegalModal.isOpen && sendConfirmationEidLegalModal.confirmCallback()
          }
          isLoading={eidSendConfirmationModalIsPending}
          loadingText={t('FormModals.sendConfirmationEidLegalModal.buttonTitleLoading')}
        >
          {t('FormModals.sendConfirmationEidLegalModal.buttonTitle')}
        </Button>
      ),
      secondaryButton: (
        <Button
          variant="outline-soft"
          size="small"
          onPress={() => setSendConfirmationEidLegalModal({ isOpen: false })}
          isDisabled={eidSendConfirmationModalIsPending}
        >
          {t('FormModals.closeButton')}
        </Button>
      ),
      isDismissable: !eidSendConfirmationModalIsPending,
      noCloseButton: eidSendConfirmationModalIsPending,
      children: (
        <>
          {t('FormModals.sendConfirmationEidLegalModal.content')}
          <Typography variant="p-small">
            {t('FormModals.sendConfirmationEidLegalModal.contentSmall')}
          </Typography>
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
      title: t('FormModals.sendConfirmationNonAuthenticatedEidModal.title'),
      type: 'info',
      primaryButton: (
        <Button
          variant="solid"
          size="small"
          onPress={() =>
            sendConfirmationNonAuthenticatedEidModal.isOpen &&
            sendConfirmationNonAuthenticatedEidModal.confirmCallback()
          }
          isLoading={eidSendConfirmationModalIsPending}
          loadingText={t('FormModals.sendConfirmationNonAuthenticatedEidModal.buttonTitleLoading')}
        >
          {t('FormModals.sendConfirmationNonAuthenticatedEidModal.buttonTitle')}
        </Button>
      ),
      secondaryButton: (
        <Button
          variant="outline-soft"
          size="small"
          onPress={() => setSendConfirmationNonAuthenticatedEidModal({ isOpen: false })}
          isDisabled={eidSendConfirmationModalIsPending}
        >
          {t('FormModals.closeButton')}
        </Button>
      ),
      isDismissable: !eidSendConfirmationModalIsPending,
      noCloseButton: eidSendConfirmationModalIsPending,
      children: t('FormModals.sendConfirmationNonAuthenticatedEidModal.content'),
    },
    {
      key: 'eidSendingModal',
      isOpen: eidSendingModal,
      onOpenChange: setEidSendingModal,
      title: t('FormModals.eidSendingModal.title'),
      type: 'info',
      primaryButton: (
        // Faux button that shows only is loading
        <Button variant="solid" size="small" isLoading onPress={() => {}} className="w-fit" />
      ),
      isDismissable: false,
      noCloseButton: true,
      children: t('FormModals.eidSendingModal.content'),
    },
    {
      key: 'eidSendErrorModal',
      isOpen: eidSendErrorModal.isOpen,
      onOpenChange: (value) => {
        if (!value) {
          setEidSendErrorModal({ isOpen: false })
        }
      },
      title: t('FormModals.eidSendErrorModal.title'),
      type: 'info',
      primaryButton: (
        <Button
          variant="solid"
          size="small"
          onPress={() => setEidSendErrorModal({ isOpen: false })}
          isDisabled={sendEidPending}
        >
          {t('FormModals.closeButton')}
        </Button>
      ),
      isDismissable: !sendEidPending,
      noCloseButton: sendEidPending,
      children: t('FormModals.eidSendErrorModal.content'),
    },
    {
      key: 'deleteConceptModal',
      isOpen: deleteConceptModal.isOpen,
      onOpenChange: (value) => {
        if (!value) {
          setDeleteConceptModal({ isOpen: false })
        }
      },
      title: t('FormModals.conceptDeleteModal.title'),
      type: 'error',
      primaryButton: (
        <Button
          variant="negative-solid"
          size="small"
          onPress={() => deleteConceptModal.isOpen && deleteConceptModal.confirmCallback()}
        >
          {t('FormModals.conceptDeleteModal.buttonTitle')}
        </Button>
      ),
      secondaryButton: (
        <Button
          variant="outline-soft"
          size="small"
          onPress={() => setDeleteConceptModal({ isOpen: false })}
        >
          {t('FormModals.closeButton')}
        </Button>
      ),
      isDismissable: false,
      noCloseButton: true,
      children: t('FormModals.conceptDeleteModal.content'),
    },
    {
      key: 'signerIsDeploying',
      isOpen: signerIsDeploying,
      onOpenChange: setSignerIsDeploying,
      type: 'info',
      title: t('FormModals.signerDeployingModal.title'),
      children: <Markdown variant="small" content={t('FormModals.signerDeployingModal.content')} />,
    },
    {
      key: 'xmlImportVersionConfirmationModal',
      isOpen: xmlImportVersionConfirmationModal.isOpen,
      onOpenChange: (value) => {
        if (!value) {
          setXmlImportVersionConfirmationModal({ isOpen: false })
        }
      },
      title: t('FormModals.xmlImportVersionConfirmationModal.title'),
      type: 'warning',
      primaryButton: (
        <Button
          variant="solid"
          size="small"
          onPress={() =>
            xmlImportVersionConfirmationModal.isOpen &&
            xmlImportVersionConfirmationModal.confirmCallback()
          }
        >
          {t('FormModals.xmlImportVersionConfirmationModal.buttonTitle')}
        </Button>
      ),
      secondaryButton: (
        <Button
          variant="outline-soft"
          size="small"
          onPress={() => setXmlImportVersionConfirmationModal({ isOpen: false })}
        >
          {t('FormModals.closeButton')}
        </Button>
      ),
      children: t('FormModals.xmlImportVersionConfirmationModal.content'),
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
