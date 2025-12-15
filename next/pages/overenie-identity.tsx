import { cityAccountClient } from '@clients/city-account'
import AccountContainer from 'components/forms/segments/AccountContainer/AccountContainer'
import AccountSuccessAlert from 'components/forms/segments/AccountSuccessAlert/AccountSuccessAlert'
import AccountVerificationPendingAlert from 'components/forms/segments/AccountVerificationPendingAlert/AccountVerificationPendingAlert'
import LoginRegisterLayout from 'components/layouts/LoginRegisterLayout'
import { Tier } from 'frontend/dtos/accountDto'
import { useRefreshServerSideProps } from 'frontend/hooks/useRefreshServerSideProps'
import { ErrorWithName, GENERIC_ERROR_MESSAGE, isError } from 'frontend/utils/errors'
import { useTranslation } from 'next-i18next'
import { useRef, useState } from 'react'

import IdentityVerificationOfPhysicalEntityForm, {
  IdentityVerificationOfPhysicalEntityFormData,
} from '../components/forms/auth-forms/IdentityVerificationOfPhysicalEntityForm'
import Button from '../components/forms/simple-components/Button'
import { SsrAuthProviderHOC } from '../components/logic/SsrAuthContext'
import { useVerifyEid, VerifyEidProvider } from '../components/verify/useVerifyEid'
import { VerifyModalsProvider } from '../components/verify/useVerifyModals'
import VerifyModals from '../components/verify/VerifyModals'
import { useQueryParamRedirect } from '../frontend/hooks/useQueryParamRedirect'
import { useSsrAuth } from '../frontend/hooks/useSsrAuth'
import { amplifyGetServerSideProps } from '../frontend/utils/amplifyServer'
import logger from '../frontend/utils/logger'
import { slovakServerSideTranslations } from '../frontend/utils/slovakServerSideTranslations'

export const getServerSideProps = amplifyGetServerSideProps(
  async () => {
    return {
      props: {
        ...(await slovakServerSideTranslations()),
      },
    }
  },
  { requiresSignIn: true, redirectQueryParam: true },
)

const IdentityVerificationPage = () => {
  const { redirect } = useQueryParamRedirect()
  const { t } = useTranslation('account')
  const [lastRc, setLastRc] = useState('')
  const [lastIdCard, setLastIdCard] = useState('')

  const [identityVerificationError, setIdentityVerificationError] = useState<Error | null>(null)
  // TODO fix is legal entity
  const { tierStatus, isLegalEntity } = useSsrAuth()
  const { openVerifyingConfirmationEidLegalModal } = useVerifyEid()

  const { refreshData } = useRefreshServerSideProps(tierStatus)

  const accountContainerRef = useRef<HTMLDivElement>(null)

  const handleErrorChange = (error: Error | null) => {
    setIdentityVerificationError(error)

    if (error) {
      accountContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const verifyIdentityAndRefreshUserData = async (
    data: IdentityVerificationOfPhysicalEntityFormData,
  ) => {
    setLastRc(data.rc)
    setLastIdCard(data.idCard)
    handleErrorChange(null)

    try {
      await cityAccountClient.verificationControllerVerifyBirthNumberAndIdentityCard(
        {
          birthNumber: data.rc.replace('/', ''),
          identityCard: data.idCard.toUpperCase(),
          turnstileToken: data.turnstileToken,
        },
        { authStrategy: 'authOnly' },
      )
      // give the queue a few seconds to process the verification
      await new Promise((resolve) => {
        setTimeout(resolve, 8000)
      })
      // status will be set according to current cognito tier - pending if still processing
      await refreshData()
      if (tierStatus.tier === Tier.NOT_VERIFIED_IDENTITY_CARD) {
        handleErrorChange(
          new ErrorWithName(
            'Unsuccessful identity verification',
            'unsuccessful-identity-verification',
          ),
        )
      }
    } catch (error) {
      if (isError(error)) {
        handleErrorChange(error)
      } else {
        logger.error(
          `${GENERIC_ERROR_MESSAGE} - unexpected object thrown in verifyIdentityAndRefreshUserData:`,
          error,
        )
        handleErrorChange(new Error('Unknown error'))
      }
    }
  }

  return (
    <LoginRegisterLayout backButtonHidden>
      <VerifyModals />
      <AccountContainer ref={accountContainerRef}>
        {(tierStatus.isIdentityVerificationNotYetAttempted ||
          tierStatus.tier === Tier.NOT_VERIFIED_IDENTITY_CARD) && (
          <>
            {isLegalEntity ? (
              <div className="flex flex-col space-y-4">
                <h1 className="text-h3">{t('identity_verification_title')}</h1>
                <p className="text-p2">{t('identity_verification_subtitle_legal_entity')}</p>
                <Button
                  variant="black"
                  onPress={openVerifyingConfirmationEidLegalModal}
                  text={t('verify_with_eid')}
                />
              </div>
            ) : (
              <IdentityVerificationOfPhysicalEntityForm
                onSubmit={verifyIdentityAndRefreshUserData}
                error={identityVerificationError}
              />
            )}
          </>
        )}
        {tierStatus.tier === Tier.QUEUE_IDENTITY_CARD && (
          <AccountVerificationPendingAlert
            title={t('auth.identity_verification_pending_title')}
            description={
              lastRc && lastIdCard
                ? t('auth.identity_verification_pending_description', {
                    rc: lastRc,
                    idCard: lastIdCard,
                  })
                : t('auth.identity_verification_pending_description_without_data')
            }
            confirmLabel={t('auth.continue_to_account')}
            onConfirm={() => redirect()}
          />
        )}
        {tierStatus.isIdentityVerified && (
          <AccountSuccessAlert
            title={t('auth.identity_verification_success_title')}
            description={
              lastRc &&
              lastIdCard &&
              t('auth.identity_verification_success_description', {
                rc: lastRc,
                idCard: lastIdCard,
              })
            }
            confirmLabel={t('auth.continue_to_account')}
            onConfirm={() => redirect()}
          />
        )}
      </AccountContainer>
    </LoginRegisterLayout>
  )
}

const IdentityVerify = () => {
  return (
    <VerifyModalsProvider>
      <VerifyEidProvider>
        <IdentityVerificationPage />
      </VerifyEidProvider>
    </VerifyModalsProvider>
  )
}

export default SsrAuthProviderHOC(IdentityVerify)
