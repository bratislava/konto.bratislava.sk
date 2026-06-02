/* eslint-disable i18next/no-literal-string */

import { Button, Typography } from '@bratislava/component-library'

import Markdown from '@/src/components/formatting/Markdown'
import {
  FormMessageModals,
  FormMessageModalsKeys,
} from '@/src/components/modals/FormModals/FormModals'
import { useFormModals } from '@/src/components/modals/FormModals/useFormModals'
import { Stack } from '@/src/components/styleguide/Stack'
import { Wrapper } from '@/src/components/styleguide/Wrapper'

const FormMessageModalsShowcase = () => {
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
    <Wrapper title="Form MessageModal variants" direction="column" noBorder>
      <Typography>
        <strong>Where is this used:</strong> All of these appear on form pages
        /mestske-sluzby/[slug]/[id].
      </Typography>
      <Stack direction="row">
        {Object.entries(formMessageModalsConfig).map(([key, value]) => (
          <div className="flex w-full flex-col gap-2" key={key}>
            <div className="flex flex-row items-center gap-2">
              <Button variant="solid" onPress={value.onPress}>
                Open
              </Button>
              <Markdown variant="small" content={`**${key}** – ${value.label}`} />
            </div>
          </div>
        ))}
        <FormMessageModals />
      </Stack>
    </Wrapper>
  )
}

export default FormMessageModalsShowcase
