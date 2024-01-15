import AccountContainer from 'components/forms/segments/AccountContainer/AccountContainer'
import AccountSuccessAlert from 'components/forms/segments/AccountSuccessAlert/AccountSuccessAlert'
import AccountVerificationPendingAlert from 'components/forms/segments/AccountVerificationPendingAlert/AccountVerificationPendingAlert'
import IdentityVerificationForm, {
  VerificationFormData,
} from 'components/forms/segments/IdentityVerificationForm/IdentityVerificationForm'
import LoginRegisterLayout from 'components/layouts/LoginRegisterLayout'
import {
  getSSRCurrentAuth,
  ServerSideAuthProviderHOC,
} from 'components/logic/ServerSideAuthProvider'
import { verifyIdentityApi, verifyLegalEntityIdentityApi } from 'frontend/api/api'
import { Tier } from 'frontend/dtos/accountDto'
import useLoginRegisterRedirect from 'frontend/hooks/useLoginRegisterRedirect'
import { useRefreshServerSideProps } from 'frontend/hooks/useRefreshServerSideProps'
import { useServerSideAuth } from 'frontend/hooks/useServerSideAuth'
import { GENERIC_ERROR_MESSAGE, isError } from 'frontend/utils/errors'
import { GetServerSidePropsContext } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useState } from 'react'

import { ROUTES } from '../frontend/api/constants'
import logger from '../frontend/utils/logger'

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const locale = ctx.locale ?? 'sk'
  const ssrCurrentAuthProps = await getSSRCurrentAuth(ctx.req)
  if (!ssrCurrentAuthProps.userData) {
    return {
      redirect: {
        destination: `${ROUTES.LOGIN}?from=${ctx.resolvedUrl}`,
        permanent: false,
      },
    }
  }

  return {
    props: {
      ssrCurrentAuthProps,
      ...(await serverSideTranslations(locale)),
    },
  }
}

const IdentityVerificationPage = () => {
  const { t } = useTranslation('account')
  const [lastIco, setLastIco] = useState<string | undefined>()
  const [lastRc, setLastRc] = useState('')
  const [lastIdCard, setLastIdCard] = useState('')

  const [identityVerificationError, setIdentityVerificationError] = useState<Error | null>(null)
  // TODO fix is legal entity
  const { tierStatus, isLegalEntity } = useServerSideAuth()

  const { redirect } = useLoginRegisterRedirect()

  const { refreshData } = useRefreshServerSideProps(tierStatus)

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
        ? verifyLegalEntityIdentityApi({
            ico: data.ico || '',
            birthNumber: data.rc.replace('/', ''),
            identityCard: data.idCard.toUpperCase(),
            turnstileToken: data.turnstileToken,
          })
        : verifyIdentityApi({
            birthNumber: data.rc.replace('/', ''),
            identityCard: data.idCard.toUpperCase(),
            turnstileToken: data.turnstileToken,
          }))
      // give the queue a few seconds to process the verification
      await new Promise((resolve) => {
        setTimeout(resolve, 8000)
      })
      // status will be set according to current cognito tier - pending if still processing
      await refreshData()
    } catch (error) {
      if (isError(error)) {
        setIdentityVerificationError(error)
      } else {
        logger.error(
          `${GENERIC_ERROR_MESSAGE} - unexpected object thrown in verifyIdentityAndRefreshUserData:`,
          error,
        )
        setIdentityVerificationError(new Error('Unknown error'))
      }
    }
  }

  return (
    <LoginRegisterLayout backButtonHidden>
      <AccountContainer className="mb-0 pt-0 md:mb-8 md:pt-6">
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
            onConfirm={() => redirect({ from: ROUTES.REGISTER })}
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
            onConfirm={() => redirect({ from: ROUTES.REGISTER })}
          />
        )}
      </AccountContainer>
    </LoginRegisterLayout>
  )
}

export default ServerSideAuthProviderHOC(IdentityVerificationPage)
