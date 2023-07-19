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

  const { isAuthenticated, tierStatus, isLegalEntity } = useServerSideAuth()

  const [registrationModal, setRegistrationModal] = useState<boolean>(true)
  const [identityVerificationModal, setIdentityVerificationModal] = useState(true)

  return (
    <>
      {skipModal.open && (
        <SkipStepModal show onClose={skipModal.onClose} onSkip={skipModal.onSkip} />
      )}

      {!isAuthenticated && (
        <RegistrationModal
          title={t('register_modal.header_sent_title')}
          subtitle={t('register_modal.header_sent_subtitle')}
          show={registrationModal}
          onClose={() => setRegistrationModal(false)}
        />
      )}
      {isAuthenticated && !tierStatus.isIdentityVerified && (
        <IdentityVerificationModal
          show={identityVerificationModal}
          onClose={() => setIdentityVerificationModal(false)}
          isLegalEntity={isLegalEntity}
        />
      )}
    </>
  )
}

export default FormModals
