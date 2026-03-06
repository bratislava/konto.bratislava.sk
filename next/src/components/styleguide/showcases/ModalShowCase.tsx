import { useState } from 'react'

import AccountMarkdown from '@/src/components/formatting/AccountMarkdown'
import FormProviders from '@/src/components/forms/FormProviders'
import { FormContextProvider } from '@/src/components/forms/useFormContext'
import { FormSentProvider } from '@/src/components/forms/useFormSent'
import {
  FormMessageModals,
  FormMessageModalsKeys,
} from '@/src/components/modals/FormModals/FormModals'
import { useFormModals } from '@/src/components/modals/FormModals/useFormModals'
import IdentityVerificationModal from '@/src/components/modals/IdentityVerificationModal'
import RegistrationModal, { RegistrationModalType } from '@/src/components/modals/RegistrationModal'
import TaxFormPdfExportModal from '@/src/components/modals/TaxFormPdfExportModal/TaxFormPdfExportModal'
import Button from '@/src/components/simple-components/Button'
import Modal from '@/src/components/simple-components/Modal'
import { Stack } from '@/src/components/styleguide/Stack'
import { mockFormServerContext } from '@/src/components/styleguide/utils/mockFormServerContext'
import { Wrapper } from '@/src/components/styleguide/Wrapper'
import MessageModal from '@/src/components/widget-components/Modals/MessageModal'

/**
 * Some modals are missing here
 * - OfficialCorrespondenceChannelChangeModal (requires data which are not easily mocked)
 * - PhoneNumberModal (not used in production)
 */

const ModalShowCaseContent = () => {
  const [simpleModal, setSimpleModalOpen] = useState(false)
  const [messageModal, setMessageModal] = useState(false)

  const formModals = useFormModals()

  const commonModalHandlerProps = {
    isOpen: true,
    confirmCallback: () => {},
  }

  /**
   * Forms use a number of message modals through the FormModals component.
   * Here we map the keys to the corresponding modal handler functions,
   * so we can easily open them in the showcase.
   */
  const formMessageModalsConfig = {
    migrationRequiredModal: {
      onPress: () => formModals.setMigrationRequiredModal(true),
      label:
        'shown when continuing to fill a draft that was saved in an older form version (migration required)',
    },
    conceptSaveErrorModal: {
      onPress: () => formModals.setConceptSaveErrorModal(true),
      label: 'shown when saving a draft fails (e.g. network error)',
    },
    sendIdentityMissingModal: {
      onPress: () => formModals.setSendIdentityMissingModal(true),
      label: 'shown when the user taps Send but has not completed identity verification',
    },
    sendFilesUploadingModal: {
      onPress: () => formModals.setSendFilesUploadingModal(true),
      label: 'shown when the user taps Send while attachments are still uploading',
    },
    sendFilesScanningModal: {
      onPress: () => formModals.setSendFilesScanningModal(true),
      label: 'shown when the user taps Send while scanned files are still being processed',
    },
    sendConfirmationModal: {
      onPress: () => formModals.setSendConfirmationModal(commonModalHandlerProps),
      label: 'shown as final confirmation before submitting the form (standard submit, no eID)',
    },
    sendConfirmationEidModal: {
      onPress: () => formModals.setSendConfirmationEidModal(commonModalHandlerProps),
      label: 'shown as final confirmation before submitting via eID (fyzicka osoba)',
    },
    sendConfirmationEidLegalModal: {
      onPress: () => formModals.setSendConfirmationEidLegalModal(commonModalHandlerProps),
      label:
        'shown as final confirmation before submitting via eID (právnická osoba alebo živnostník)',
    },
    sendConfirmationNonAuthenticatedEidModal: {
      onPress: () =>
        formModals.setSendConfirmationNonAuthenticatedEidModal(commonModalHandlerProps),
      label: 'shown as final confirmation before submitting via eID when not signed in',
    },
    eidSendingModal: {
      onPress: () => formModals.setEidSendingModal(true),
      label: 'shown while the form is being sent via eID',
    },
    eidSendErrorModal: {
      onPress: () => formModals.setEidSendErrorModal(commonModalHandlerProps),
      label: 'shown when sending via eID fails',
    },
    deleteConceptModal: {
      onPress: () => formModals.setDeleteConceptModal(commonModalHandlerProps),
      label: "when the user chooses 'Delete draft' from the form's three-dot menu",
    },
    signerIsDeploying: {
      onPress: () => formModals.setSignerIsDeploying(true),
      label: 'shown when the user uses the signer and it is still loading or deploying',
    },
    xmlImportVersionConfirmationModal: {
      onPress: () => formModals.setXmlImportVersionConfirmationModal(commonModalHandlerProps),
      label: 'shown when the user imports an XML file created in an older form version',
    },
  } satisfies Record<FormMessageModalsKeys, { onPress: () => void; label: string }>

  return (
    <Wrapper direction="column" title="Modals">
      <Wrapper title="Base" direction="column" noBorder>
        <p>
          <strong>Where is this used:</strong> Base Modal is the building block for custom modal
          content across the app. MessageModal is used for specific usecases outlined below.
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

      <Modal isOpen={simpleModal} onOpenChange={setSimpleModalOpen} modalClassname="max-w-[700px]">
        <div className="flex flex-col gap-4">
          <h2 className="text-h3 font-semibold">Simple Modal Example</h2>
          <div className="flex flex-col gap-4">
            <div className="flex w-full items-center justify-center rounded-lg bg-background-passive-primary p-4">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum
              has been the industry&apos;s standard dummy text ever since the 1500s, when an unknown
              printer took a galley of type and scrambled it to make a type specimen book.
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
        This is a message modal. Buttons are optional, and anything can be added as children.
      </MessageModal>

      <Wrapper title="Form MessageModal variants" direction="column" noBorder>
        <p>
          <strong>Where is this used:</strong> All of these appear on form pages
          /mestske-sluzby/[slug]/[id].
        </p>

        <Stack direction="row">
          {Object.entries(formMessageModalsConfig).map(([key, value]) => (
            <div className="flex w-full flex-col gap-2" key={key}>
              <div className="flex flex-row items-center gap-2">
                <Button variant="solid" onPress={value.onPress}>
                  Open
                </Button>
                <AccountMarkdown variant="sm" content={`**${key}** – ${value.label}`} />
              </div>
            </div>
          ))}
          <FormMessageModals />
        </Stack>
      </Wrapper>

      <Wrapper title="Tax form PDF export modal" direction="column" noBorder>
        <p>
          <strong>Where is this used:</strong> Usage: when the user exports form as PDF (form menu →
          Export PDF). Shows loading while the PDF is generated, then success when done. Used only
          for tax forms.
        </p>
        <Stack direction="column">
          <Button
            variant="solid"
            onPress={() =>
              formModals.setTaxFormPdfExportModal({ type: 'loading', onClose: () => {} })
            }
          >
            Tax form PDF export - loading state
          </Button>
          <Button
            variant="solid"
            onPress={() => formModals.setTaxFormPdfExportModal({ type: 'success' })}
          >
            Tax form PDF export - success state
          </Button>
          <TaxFormPdfExportModal
            state={formModals.taxFormPdfExportModal}
            isOpen={formModals.taxFormPdfExportModal != null}
            onOpenChange={(value) => {
              if (!value) {
                formModals.setTaxFormPdfExportModal(null)
              }
            }}
          />
        </Stack>
      </Wrapper>

      <Wrapper title="Identity verification modal" direction="column" noBorder>
        <p>
          <strong>Where is this used:</strong> Usage: explains that identity verification is
          required and offers a button to go to the verification page. Shown when the user needs to
          verify their identity in the form context (e.g. before sending or from a verify-identity
          action).
        </p>
        <Stack direction="column">
          <Button variant="solid" onPress={() => formModals.setIdentityVerificationModal(true)}>
            Identity verification modal
          </Button>
          <IdentityVerificationModal
            isOpen={formModals.identityVerificationModal}
            onOpenChange={formModals.setIdentityVerificationModal}
            accountType={undefined}
          />
        </Stack>
      </Wrapper>

      <Wrapper title="Registration modal" direction="column" noBorder>
        <p>
          <strong>Where is this used:</strong> Form page. Each variant is shown when the user is not
          signed in: <strong>Initial</strong> when opening a form that requires sign-in;{' '}
          <strong>NotAuthenticatedConceptSave</strong> when tapping Save draft;{' '}
          <strong>NotAuthenticatedSubmitForm</strong> when tapping Send.
        </p>
        <Stack direction="column">
          <Button
            variant="solid"
            onPress={() => formModals.setRegistrationModal(RegistrationModalType.Initial)}
          >
            Variant: Initial
          </Button>
          <Button
            variant="solid"
            onPress={() =>
              formModals.setRegistrationModal(RegistrationModalType.NotAuthenticatedConceptSave)
            }
          >
            Variant: NotAuthenticatedConceptSave
          </Button>
          <Button
            variant="solid"
            onPress={() =>
              formModals.setRegistrationModal(RegistrationModalType.NotAuthenticatedSubmitForm)
            }
          >
            Variant: NotAuthenticatedSubmitForm
          </Button>
          <RegistrationModal
            type={formModals.registrationModal}
            isOpen={formModals.registrationModal != null}
            onOpenChange={(value) => {
              if (!value) {
                formModals.setRegistrationModal(null)
              }
            }}
            login={() => {}}
            register={() => {}}
          />
        </Stack>
      </Wrapper>
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
