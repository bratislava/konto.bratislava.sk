import { useState } from 'react'

import FormProviders from '@/src/components/forms/FormProviders'
import { FormContextProvider } from '@/src/components/forms/useFormContext'
import { FormSentProvider } from '@/src/components/forms/useFormSent'
import FormModals, {
  FormMessageModalsKey,
  formMessageModalsKeys,
} from '@/src/components/modals/FormModals/FormModals'
import { useFormModals } from '@/src/components/modals/FormModals/useFormModals'
import Button from '@/src/components/simple-components/Button'
import Modal from '@/src/components/simple-components/Modal'
import { Stack } from '@/src/components/styleguide/Stack'
import { mockFormServerContext } from '@/src/components/styleguide/utils/mockFormServerContext'
import { Wrapper } from '@/src/components/styleguide/Wrapper'
import MessageModal from '@/src/components/widget-components/Modals/MessageModal'

const ModalShowCaseContent = () => {
  const [simpleModalOpen, setSimpleModalOpen] = useState(false)
  const [messageModal, setMessageModal] = useState(false)

  const formModals = useFormModals()

  const commonModalHandlerProps = {
    isOpen: true,
    confirmCallback: () => {},
  }

  /**
   * Forms use a number of message modals. Here we map the keys to the corresponding modal handler functions,
   * so we can easily open them in the showcase.
   */
  const formMessageModalsHandlerMap: Record<FormMessageModalsKey, () => void> = {
    migrationRequiredModal: () => formModals.setMigrationRequiredModal(true),
    conceptSaveErrorModal: () => formModals.setConceptSaveErrorModal(true),
    sendIdentityMissingModal: () => formModals.setSendIdentityMissingModal(true),
    sendFilesUploadingModal: () => formModals.setSendFilesUploadingModal(true),
    sendFilesScanningModal: () => formModals.setSendFilesScanningModal(true),
    sendConfirmationModal: () => formModals.setSendConfirmationModal(commonModalHandlerProps),
    sendConfirmationEidModal: () => formModals.setSendConfirmationEidModal(commonModalHandlerProps),
    sendConfirmationEidLegalModal: () =>
      formModals.setSendConfirmationEidLegalModal(commonModalHandlerProps),
    sendConfirmationNonAuthenticatedEidModal: () =>
      formModals.setSendConfirmationNonAuthenticatedEidModal(commonModalHandlerProps),
    eidSendingModal: () => formModals.setEidSendingModal(true),
    eidSendErrorModal: () => formModals.setEidSendErrorModal(commonModalHandlerProps),
    deleteConceptModal: () => formModals.setDeleteConceptModal(commonModalHandlerProps),
    signerIsDeploying: () => formModals.setSignerIsDeploying(true),
    xmlImportVersionConfirmationModal: () =>
      formModals.setXmlImportVersionConfirmationModal(commonModalHandlerProps),
  }

  const modalsShowcaseButtons = formMessageModalsKeys.map((key) => {
    return {
      key,
      button: (
        <Button
          variant="solid"
          onPress={() => {
            formMessageModalsHandlerMap[key]()
          }}
        >
          Open {key}
        </Button>
      ),
    }
  })

  return (
    <Wrapper direction="column" title="Modal">
      {/**
       * TODO Add remaining Form modals:
       * - OfficialCorrespondenceChannelChangeModal
       * - PhoneNumberModal
       * - RegistrationModal
       * - TaxFormPdfExportModal
       */}

      <Stack direction="column">
        <Wrapper title="Base" direction="column" noBorder>
          <p>
            <strong>Where in production:</strong> Base Modal and MessageModal are used across the
            app for confirmations, errors, and alerts. MessageModal appears e.g. when deleting a
            draft (Moje žiadosti → three-dot menu → Delete).
          </p>
          <Stack direction="column">
            <Button variant="solid" onPress={() => setSimpleModalOpen(true)}>
              Open simple modal
            </Button>
            <Button variant="solid" onPress={() => setMessageModal(true)}>
              Open message modal
            </Button>
          </Stack>
        </Wrapper>

        <Modal
          isOpen={simpleModalOpen}
          onOpenChange={setSimpleModalOpen}
          modalClassname="max-w-[700px]"
        >
          <div className="flex flex-col gap-4">
            <h2 className="text-h3 font-semibold">Simple Modal Example</h2>
            <div className="flex flex-col gap-4">
              <div className="flex w-full items-center justify-center rounded-lg bg-background-passive-primary p-4">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem
                Ipsum has been the industry&apos;s standard dummy text ever since the 1500s, when an
                unknown printer took a galley of type and scrambled it to make a type specimen book.
              </div>
              <div className="mt-2 flex justify-between">
                <Button variant="outline" onPress={() => setSimpleModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="solid" onPress={() => setSimpleModalOpen(false)}>
                  Submit
                </Button>
              </div>
            </div>
          </div>
        </Modal>

        <MessageModal
          type="success"
          isOpen={messageModal}
          onOpenChange={setMessageModal}
          title="Lorem ipsum"
          primaryButton={
            <Button key="test-button" variant="solid">
              Test button
            </Button>
          }
          secondaryButton={
            <Button key="test-button" variant="outline">
              Test button
            </Button>
          }
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </MessageModal>

        <Wrapper title="Form MessageModal variants" direction="column" noBorder>
          <p>
            <strong>Where in production:</strong> All appear during form filling (form pages
            /mestske-sluzby/[slug]/[id]). Migration required when opening an old-version form;
            concept save error when Save fails; send identity missing when submitting without
            verification; files uploading/scanning during attach/scan; send confirmation (and eID
            variants) before/after submit; eID sending/error during eID flow; delete concept from
            form menu; signer deploying when using signer; XML import version when importing an
            older XML.
          </p>

          <Stack direction="row">
            {modalsShowcaseButtons.map(({ key }) => (
              <div key={key}>
                <Button variant="solid" onPress={() => formMessageModalsHandlerMap[key]()}>
                  {key}
                </Button>
              </div>
            ))}
            <FormModals />
          </Stack>
        </Wrapper>
      </Stack>
    </Wrapper>
  )
}

const ModalShowCase = () => {
  const mockedFormServerContext = mockFormServerContext()

  return (
    <FormContextProvider formServerContext={mockedFormServerContext}>
      <FormSentProvider initialFormSent={mockedFormServerContext.initialFormSent}>
        <FormProviders>
          <ModalShowCaseContent />
        </FormProviders>
      </FormSentProvider>
    </FormContextProvider>
  )
}
export default ModalShowCase
