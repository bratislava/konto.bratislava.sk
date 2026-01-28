import { cityAccountClient } from '@clients/city-account'
import AccountContainer from 'components/forms/segments/AccountContainer/AccountContainer'
import AccountSuccessAlert from 'components/forms/segments/AccountSuccessAlert/AccountSuccessAlert'
import AccountVerificationPendingAlert from 'components/forms/segments/AccountVerificationPendingAlert/AccountVerificationPendingAlert'
import PageLayout from 'components/layouts/PageLayout'
import { useRefreshServerSideProps } from 'frontend/hooks/useRefreshServerSideProps'
import { ErrorWithName, GENERIC_ERROR_MESSAGE, isError } from 'frontend/utils/errors'
import { useTranslation } from 'next-i18next'
import { useRef, useState } from 'react'

import IdentityVerificationOfPhysicalEntityForm, {
  IdentityVerificationOfPhysicalEntityFormData,
} from '../components/forms/auth-forms/IdentityVerificationOfPhysicalEntityForm'
import { SsrAuthProviderHOC } from '../components/logic/SsrAuthContext'
import LegalPersonVerificationPageContent from '../components/verify/LegalPersonVerificationPageContent'
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
      if (tierStatus.isNotVerifiedIdentityCard) {
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
    <PageLayout variant="login-register" hideBackButton>
      <AccountContainer ref={accountContainerRef}>
        {(tierStatus.isIdentityVerificationNotYetAttempted ||
          tierStatus.isNotVerifiedIdentityCard) && (
            <>
              {isLegalEntity ? (
                <LegalPersonVerificationPageContent />
              ) : (
                <IdentityVerificationOfPhysicalEntityForm
                  onSubmit={verifyIdentityAndRefreshUserData}
                  error={identityVerificationError}
                />
              )}
            </>
          )}
        {tierStatus.isInQueue && (
          <AccountVerificationPendingAlert
            title={t('auth.identity_verification.fo.pending.title')}
            description={
              lastRc && lastIdCard
                ? t('auth.identity_verification.fo.pending.content', {
                  rc: lastRc,
                  idCard: lastIdCard,
                })
                : t('auth.identity_verification.fo.pending.content_without_data')
            }
            confirmLabel={t('auth.continue_to_account')}
            onConfirm={() => redirect()}
          />
        )}
        {tierStatus.isIdentityVerified && (
          <AccountSuccessAlert
            title={t('auth.identity_verification.common.success.title')}
            // TODO legal entity text (lastRc && lastIdCard is used only for FO)
            description={
              lastRc &&
              lastIdCard &&
              t('auth.identity_verification.fo.success.content', {
                rc: lastRc,
                idCard: lastIdCard,
              })
            }
            confirmLabel={t('auth.continue_to_account')}
            onConfirm={() => redirect()}
          />
        )}
      </AccountContainer>
    </PageLayout>
  )
}

export default SsrAuthProviderHOC(IdentityVerificationPage)
