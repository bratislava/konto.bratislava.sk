import { useServerSideAuth } from 'frontend/hooks/useServerSideAuth'
import React from 'react'

import { useFormState } from '../../FormStateProvider'
import { useFormModals } from '../../useFormModals'
import IdentityVerificationModal from '../IdentityVerificationModal/IdentityVerificationModal'
import OldSchemaVersionModal from '../OldSchemaVersionModal/OldSchemaVersionModal'
import RegistrationModal from '../RegistrationModal/RegistrationModal'
import SkipStepModal from '../SkipStepModal/SkipStepModal'

const FormModals = () => {
  const {
    oldSchemaModal,
    setOldSchemaModal,
    registrationModal,
    setRegistrationModal,
    identityVerificationModal,
    setIdentityVerificationModal,
  } = useFormModals()
  const { skipModal } = useFormState()

  const { accountType } = useServerSideAuth()

  return (
    <>
      <OldSchemaVersionModal
        isOpen={oldSchemaModal}
        onOpenChange={setOldSchemaModal}
        isDismissable
      />
      <SkipStepModal
        isOpen={skipModal.open}
        onOpenChange={skipModal.open ? skipModal.onOpenChange : () => {}}
        onSkip={skipModal.open ? skipModal.onSkip : () => {}}
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
    </>
  )
}

export default FormModals
