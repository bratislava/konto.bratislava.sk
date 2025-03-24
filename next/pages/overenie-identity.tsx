import { cityAccountClient } from '@clients/city-account'
import AccountContainer from 'components/forms/segments/AccountContainer/AccountContainer'
import AccountSuccessAlert from 'components/forms/segments/AccountSuccessAlert/AccountSuccessAlert'
import AccountVerificationPendingAlert from 'components/forms/segments/AccountVerificationPendingAlert/AccountVerificationPendingAlert'
import IdentityVerificationForm, {
  VerificationFormData,
} from 'components/forms/segments/IdentityVerificationForm/IdentityVerificationForm'
import LoginRegisterLayout from 'components/layouts/LoginRegisterLayout'
import { Tier } from 'frontend/dtos/accountDto'
import { useRefreshServerSideProps } from 'frontend/hooks/useRefreshServerSideProps'
import { GENERIC_ERROR_MESSAGE, isError } from 'frontend/utils/errors'
import { useTranslation } from 'next-i18next'
import { useRef, useState } from 'react'

import { SsrAuthProviderHOC } from '../components/logic/SsrAuthContext'
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
  const [lastIco, setLastIco] = useState<string | undefined>()
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

  const verifyIdentityAndRefreshUserData = async (data: VerificationFormData) => {
    setLastIco(data.ico)
    setLastRc(data.rc)
    setLastIdCard(data.idCard)

    // sanity check
    if (isLegalEntity && !data.ico) {
      logger.error(`${GENERIC_ERROR_MESSAGE} - submitted legal entity verification without ICO`)
    }
    try {
      await (isLegalEntity && data.ico
        ? cityAccountClient.verificationControllerVerifyIcoBirthNumberAndIdentityCard(
            {
              ico: data.ico || '',
              birthNumber: data.rc.replace('/', ''),
              identityCard: data.idCard.toUpperCase(),
              turnstileToken: data.turnstileToken,
            },
            { accessToken: 'always' },
          )
        : cityAccountClient.verificationControllerVerifyBirthNumberAndIdentityCard(
            {
              birthNumber: data.rc.replace('/', ''),
              identityCard: data.idCard.toUpperCase(),
              turnstileToken: data.turnstileToken,
            },
            { accessToken: 'always' },
          ))
      // give the queue a few seconds to process the verification
      await new Promise((resolve) => {
        setTimeout(resolve, 8000)
      })
      // status will be set according to current cognito tier - pending if still processing
      await refreshData()
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
      <AccountContainer className="mb-0 md:mb-8 md:pt-6" ref={accountContainerRef}>
        {tierStatus.isIdentityVerificationNotYetAttempted && (
          <IdentityVerificationForm
            isLegalEntity={isLegalEntity}
            onSubmit={verifyIdentityAndRefreshUserData}
            error={identityVerificationError}
          />
        )}
        {tierStatus.tier === Tier.NOT_VERIFIED_IDENTITY_CARD && (
          <IdentityVerificationForm
            isLegalEntity={isLegalEntity}
            onSubmit={verifyIdentityAndRefreshUserData}
            error={identityVerificationError}
          />
        )}
        {tierStatus.tier === Tier.QUEUE_IDENTITY_CARD && (
          <AccountVerificationPendingAlert
            title={t('identity_verification_pending_title')}
            description={
              isLegalEntity
                ? lastIco && lastRc && lastIdCard
                  ? t('identity_verification_pending_description_legal_entity', {
                      ico: lastIco,
                      rc: lastRc,
                      idCard: lastIdCard,
                    })
                  : t('identity_verification_pending_description_without_data_legal_entity')
                : lastRc && lastIdCard
                  ? t('identity_verification_pending_description', {
                      rc: lastRc,
                      idCard: lastIdCard,
                    })
                  : t('identity_verification_pending_description_without_data')
            }
            confirmLabel={t('account_continue_link')}
            onConfirm={() => redirect()}
          />
        )}
        {tierStatus.isIdentityVerified && (
          <AccountSuccessAlert
            title={t('identity_verification_success_title')}
            description={
              lastRc &&
              lastIdCard &&
              t('identity_verification_success_description', {
                rc: lastRc,
                idCard: lastIdCard,
              })
            }
            confirmLabel={t('account_continue_link')}
            onConfirm={() => redirect()}
          />
        )}
      </AccountContainer>
    </LoginRegisterLayout>
  )
}

export default SsrAuthProviderHOC(IdentityVerificationPage)
