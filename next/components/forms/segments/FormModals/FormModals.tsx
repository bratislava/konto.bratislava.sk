import { useServerSideAuth } from 'frontend/hooks/useServerSideAuth'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { useFormExportImport } from '../../../../frontend/hooks/useFormExportImport'
import { useFormState } from '../../FormStateProvider'
import Button from '../../simple-components/ButtonNew'
import { useFormModals } from '../../useFormModals'
import MessageModal from '../../widget-components/Modals/MessageModal'
import ConceptSaveErrorModal from '../ConceptSaveErrorModal/ConceptSaveErrorModal'
import IdentityVerificationModal from '../IdentityVerificationModal/IdentityVerificationModal'
import OldSchemaVersionModal from '../OldSchemaVersionModal/OldSchemaVersionModal'
import RegistrationModal from '../RegistrationModal/RegistrationModal'
import SkipStepModal from '../SkipStepModal/SkipStepModal'

const FormModals = () => {
  const { t } = useTranslation('forms')

  const {
    oldSchemaModal,
    setOldSchemaModal,
    registrationModal,
    setRegistrationModal,
    identityVerificationModal,
    setIdentityVerificationModal,
    conceptSaveErrorModal,
    setConceptSaveErrorModal,
  } = useFormModals()
  const { saveConcept, saveConceptIsLoading } = useFormExportImport()

  const { skipModal } = useFormState()

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

      <MessageModal
        isOpen={skipModal.open}
        onOpenChange={skipModal.onOpenChange}
        type="error"
        title={t('concept_save_error_modal.title')}
        buttons={[
          <Button onPress={() => skipModal.onOpenChange(false)}>
            {t('skip_step_modal.button_skip_text')}
          </Button>,
          <Button variant="category-solid" onPress={() => skipModal.onSkip()}>
            {t('skip_step_modal.button_submit_text')}
          </Button>,
        ]}
      >
        {t('concept_save_error_modal.text')}
      </MessageModal>

      <MessageModal
        isOpen={conceptSaveErrorModal}
        onOpenChange={setConceptSaveErrorModal}
        type="error"
        title={t('concept_save_error_modal.title')}
        buttons={[
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
        ]}
      >
        {t('concept_save_error_modal.text')}
      </MessageModal>
    </>
  )
}

export default FormModals
