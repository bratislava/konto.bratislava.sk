import { useTranslation } from 'next-i18next'
import React, { forwardRef, useImperativeHandle, useState } from 'react'

import useAccount, { AccountStatus } from '../../../../frontend/hooks/useAccount'
import IdentityVerificationModal from '../IdentityVerificationModal/IdentityVerificationModal'
import RegistrationModal from '../RegistrationModal/RegistrationModal'
import SkipStepModal from '../SkipStepModal/SkipStepModal'

export type FormModalsRef = {
  skipButtonHandler: (nextStepIndex?: number) => void
  openRegistrationModal: () => void
  isAnyModalOpen: boolean
}
type FormModalsProps = { skipToStep: (stepIndex: number) => void; stepIndex: number }

const FormModals = forwardRef<FormModalsRef, FormModalsProps>(
  ({ skipToStep, stepIndex }: FormModalsProps, ref) => {
    const { t } = useTranslation('account')

    const { isAuth, status, userData } = useAccount()

    const [isOnShowSkipModal, setIsOnShowSkipModal] = useState<boolean>(false)
    const [registrationModal, setRegistrationModal] = useState<boolean>(!isAuth)
    const [identityVerificationModal, setIdentityVerificationModal] = useState(isAuth && status !== AccountStatus.IdentityVerificationSuccess)
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
      isAnyModalOpen: registrationModal || identityVerificationModal,
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
        {!isAuth && (
          <RegistrationModal
            title={t('register_modal.header_sent_title')}
            subtitle={t('register_modal.header_sent_subtitle')}
            show={registrationModal}
            onClose={() => setRegistrationModal(false)}
          />
        )}
        {isAuth && status !== AccountStatus.IdentityVerificationSuccess && (
          <IdentityVerificationModal
            show={identityVerificationModal}
            onClose={() => setIdentityVerificationModal(false)}
            userType={userData?.account_type}
          />
        )}
      </>
    )
  },
)

export default FormModals
