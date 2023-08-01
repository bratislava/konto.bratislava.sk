import AccountContainer from 'components/forms/segments/AccountContainer/AccountContainer'
import AccountSuccessAlert from 'components/forms/segments/AccountSuccessAlert/AccountSuccessAlert'
import AccountVerificationPendingAlert from 'components/forms/segments/AccountVerificationPendingAlert/AccountVerificationPendingAlert'
import IdentityVerificationForm from 'components/forms/segments/IdentityVerificationForm/IdentityVerificationForm'
import LoginRegisterLayout from 'components/layouts/LoginRegisterLayout'
import {
  getSSRCurrentAuth,
  ServerSideAuthProviderHOC,
} from 'components/logic/ServerSideAuthProvider'
import { verifyIdentityApi } from 'frontend/api/api'
import { Tier } from 'frontend/dtos/accountDto'
import { useRefreshServerSideProps } from 'frontend/hooks/useRefreshServerSideProps'
import { useServerSideAuth } from 'frontend/hooks/useServerSideAuth'
import { GENERIC_ERROR_MESSAGE, isError } from 'frontend/utils/errors'
import { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useEffect, useState } from 'react'

import PageWrapper from '../components/layouts/PageWrapper'
import { ROUTES } from '../frontend/api/constants'
import logger from '../frontend/utils/logger'
import { formatUnicorn } from '../frontend/utils/string'
import { AsyncServerProps } from '../frontend/utils/types'

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const locale = ctx.locale ?? 'sk'

  return {
    props: {
      ssrCurrentAuthProps: await getSSRCurrentAuth(ctx.req),
      page: {
        locale: ctx.locale,
        localizations: ['sk', 'en']
          .filter((l) => l !== ctx.locale)
          .map((l) => ({
            slug: '',
            locale: l,
          })),
      },
      ...(await serverSideTranslations(locale)),
    },
  }
}

const IdentityVerificationPage = ({ page }: AsyncServerProps<typeof getServerSideProps>) => {
  const { t } = useTranslation('account')
  const [lastRc, setLastRc] = useState('')
  const [lastIdCard, setLastIdCard] = useState('')

  const [identityVerificationError, setIdentityVerificationError] = useState<Error | null>(null)
  const { isAuthenticated, tierStatus } = useServerSideAuth()

  const router = useRouter()
  const { refreshData } = useRefreshServerSideProps(tierStatus)
  useEffect(() => {
    if (!isAuthenticated) {
      router
        .push({ pathname: ROUTES.LOGIN, query: { from: router.route } })
        .catch((error_) => logger.error('Failed redirect', error_))
    }
  }, [isAuthenticated, router])

  const verifyIdentityAndRefreshUserData = async (
    rc: string,
    idCard: string,
    turnstileToken: string,
  ) => {
    setLastRc(rc)
    setLastIdCard(idCard)
    try {
      await verifyIdentityApi({
        birthNumber: rc.replace('/', ''),
        identityCard: idCard.toUpperCase(),
        turnstileToken,
      })
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
    <PageWrapper locale={page.locale} localizations={page.localizations}>
      <LoginRegisterLayout backButtonHidden>
        <AccountContainer className="mb-0 pt-0 md:mb-8 md:pt-6">
          {tierStatus.isIdentityVerificationNotYetAttempted && (
            <IdentityVerificationForm
              onSubmit={verifyIdentityAndRefreshUserData}
              error={identityVerificationError}
            />
          )}
          {tierStatus.tier === Tier.NOT_VERIFIED_IDENTITY_CARD && (
            <IdentityVerificationForm
              onSubmit={verifyIdentityAndRefreshUserData}
              error={identityVerificationError}
            />
          )}
          {tierStatus.tier === Tier.QUEUE_IDENTITY_CARD && (
            <AccountVerificationPendingAlert
              title={t('identity_verification_pending_title')}
              description={
                lastRc && lastIdCard
                  ? formatUnicorn(t('identity_verification_pending_description'), {
                      rc: lastRc,
                      idCard: lastIdCard,
                    })
                  : t('identity_verification_pending_description_without_data')
              }
              confirmLabel={t('account_continue_link')}
              onConfirm={() =>
                router.push({ pathname: ROUTES.HOME, query: { from: ROUTES.REGISTER } })
              }
            />
          )}
          {tierStatus.isIdentityVerified && (
            <AccountSuccessAlert
              title={t('identity_verification_success_title')}
              description={
                lastRc &&
                lastIdCard &&
                formatUnicorn(t('identity_verification_success_description'), {
                  rc: lastRc,
                  idCard: lastIdCard,
                })
              }
              confirmLabel={t('account_continue_link')}
              onConfirm={() =>
                router.push({ pathname: ROUTES.HOME, query: { from: ROUTES.REGISTER } })
              }
            />
          )}
        </AccountContainer>
      </LoginRegisterLayout>
    </PageWrapper>
  )
}

export default ServerSideAuthProviderHOC(IdentityVerificationPage)
