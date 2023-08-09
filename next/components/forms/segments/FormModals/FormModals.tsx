import { useServerSideAuth } from 'frontend/hooks/useServerSideAuth'
import { useTranslation } from 'next-i18next'
import React, { useState } from 'react'

import { useFormState } from '../../FormStateProvider'
import IdentityVerificationModal from '../IdentityVerificationModal/IdentityVerificationModal'
import RegistrationModal from '../RegistrationModal/RegistrationModal'
import SkipStepModal from '../SkipStepModal/SkipStepModal'

const FormModals = () => {
  const { skipModal } = useFormState()
  const { t } = useTranslation('account')

  const { isAuthenticated, tierStatus, accountType } = useServerSideAuth()

  const [registrationModal, setRegistrationModal] = useState<boolean>(!isAuthenticated)
  const [identityVerificationModal, setIdentityVerificationModal] = useState(
    isAuthenticated && !tierStatus.isIdentityVerified,
  )

  return (
    <>
      <SkipStepModal
        isOpen={skipModal.open}
        onOpenChange={skipModal.open ? skipModal.onOpenChange : () => {}}
        onSkip={skipModal.open ? skipModal.onSkip : () => {}}
        isDismissable
      />
      <RegistrationModal
        title={t('register_modal.header_sent_title')}
        subtitle={t('register_modal.header_sent_subtitle')}
        isOpen={registrationModal}
        onOpenChange={setRegistrationModal}
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
