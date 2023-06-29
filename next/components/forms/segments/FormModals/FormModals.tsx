import { usePageWrapperContext } from 'components/layouts/PageWrapper'
import { AccountStatus, mapTierToStatus } from 'frontend/utils/amplify'
import { useTranslation } from 'next-i18next'
import React, { forwardRef, useImperativeHandle, useState } from 'react'

import IdentityVerificationModal from '../IdentityVerificationModal/IdentityVerificationModal'
import RegistrationModal from '../RegistrationModal/RegistrationModal'
import SkipStepModal from '../SkipStepModal/SkipStepModal'

export type FormModalsRef = {
  skipButtonHandler: (nextStepIndex?: number) => void
  openRegistrationModal: () => void
}
type FormModalsProps = { skipToStep: (stepIndex: number) => void; stepIndex: number }

const FormModals = forwardRef<FormModalsRef, FormModalsProps>(
  ({ skipToStep, stepIndex }: FormModalsProps, ref) => {
    const { t } = useTranslation('account')

    const {
      auth: { isAuthenticated, userData },
    } = usePageWrapperContext()
    const status = mapTierToStatus(userData?.['custom:tier'])

    const [isOnShowSkipModal, setIsOnShowSkipModal] = useState<boolean>(false)
    const [registrationModal, setRegistrationModal] = useState<boolean>(true)
    const [identityVerificationModal, setIdentityVerificationModal] = useState(true)
    const [skipModalWasShown, setSkipModalWasShown] = useState<boolean>(false)
    const [skipModalNextStepIndex, setSkipModalNextStepIndex] = useState<number>(stepIndex)

    const skipButtonHandler = (nextStepIndex: number = stepIndex + 1) => {
      if (skipModalWasShown) {
        skipToStep(nextStepIndex)
      } else {
        setSkipModalNextStepIndex(nextStepIndex)
        setIsOnShowSkipModal(true)
      }
    }

    useImperativeHandle(ref, () => ({
      skipButtonHandler,
      openRegistrationModal: () => setRegistrationModal(true),
    }))

    return (
      <>
        <SkipStepModal
          show={isOnShowSkipModal && !skipModalWasShown}
          onClose={() => {
            setIsOnShowSkipModal(false)
            setSkipModalWasShown(true)
          }}
          onSkip={() => {
            skipToStep(skipModalNextStepIndex)
            setIsOnShowSkipModal(false)
            setSkipModalWasShown(true)
          }}
        />
        {!isAuthenticated && (
          <RegistrationModal
            title={t('register_modal.header_sent_title')}
            subtitle={t('register_modal.header_sent_subtitle')}
            show={registrationModal}
            onClose={() => setRegistrationModal(false)}
          />
        )}
        {isAuthenticated && status !== AccountStatus.IdentityVerificationSuccess && (
          <IdentityVerificationModal
            show={identityVerificationModal}
            onClose={() => setIdentityVerificationModal(false)}
            userType={userData?.['custom:account_type']}
          />
        )}
      </>
    )
  },
)

export default FormModals
