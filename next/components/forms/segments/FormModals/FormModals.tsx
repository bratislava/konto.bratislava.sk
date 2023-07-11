import { useServerSideAuth } from 'frontend/hooks/useServerSideAuth'
import { isProductionDeployment } from 'frontend/utils/general'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import React, { useState } from 'react'

import { useFormState } from '../../FormStateProvider'
import IdentityVerificationModal from '../IdentityVerificationModal/IdentityVerificationModal'
import RegistrationModal from '../RegistrationModal/RegistrationModal'
import SkipStepModal from '../SkipStepModal/SkipStepModal'

const FormModals = () => {
  const { skipModal } = useFormState()
  const { t } = useTranslation('account')

  // don't show modals when we prefill data automatically
  const router = useRouter()
  const shouldPrefill = router.query.prefill === 'true' && isProductionDeployment()

  const { isAuthenticated, tierStatus, isLegalEntity } = useServerSideAuth()

  const [registrationModal, setRegistrationModal] = useState<boolean>(true)
  const [identityVerificationModal, setIdentityVerificationModal] = useState(true)

  return (
    <>
      {skipModal.open && (
        <SkipStepModal show onClose={skipModal.onClose} onSkip={skipModal.onSkip} />
      )}

      {!shouldPrefill && !isAuthenticated && (
        <RegistrationModal
          title={t('register_modal.header_sent_title')}
          subtitle={t('register_modal.header_sent_subtitle')}
          show={registrationModal}
          onClose={() => setRegistrationModal(false)}
        />
      )}
      {!shouldPrefill && isAuthenticated && !tierStatus.isIdentityVerified && (
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
