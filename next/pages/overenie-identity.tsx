import { ROUTES } from '@utils/constants'
import logger from '@utils/logger'
import { formatUnicorn } from '@utils/string'
import { AsyncServerProps } from '@utils/types'
import useAccount, { AccountStatus } from '@utils/useAccount'
import { isProductionDeployment } from '@utils/utils'
import AccountContainer from 'components/forms/segments/AccountContainer/AccountContainer'
import AccountSuccessAlert from 'components/forms/segments/AccountSuccessAlert/AccountSuccessAlert'
import AccountVerificationPendingAlert from 'components/forms/segments/AccountVerificationPendingAlert/AccountVerificationPendingAlert'
import IdentityVerificationForm from 'components/forms/segments/IdentityVerificationForm/IdentityVerificationForm'
import LoginRegisterLayout from 'components/layouts/LoginRegisterLayout'
import { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useEffect, useState } from 'react'

import PageWrapper from '../components/layouts/PageWrapper'

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const locale = ctx.locale ?? 'sk'

  return {
    props: {
      page: {
        locale: ctx.locale,
        localizations: ['sk', 'en']
          .filter((l) => l !== ctx.locale)
          .map((l) => ({
            slug: '',
            locale: l,
          })),
      },
      isProductionDeployment: isProductionDeployment(),
      ...(await serverSideTranslations(locale)),
    },
  }
}

const IdentityVerificationPage = ({ page }: AsyncServerProps<typeof getServerSideProps>) => {
  const { t } = useTranslation('account')
  const [lastRc, setLastRc] = useState('')
  const [lastIdCard, setLastIdCard] = useState('')
  const { error, status, verifyIdentity, isAuth, refreshUserData } = useAccount()
  const router = useRouter()
  useEffect(() => {
    if (!isAuth) {
      router
        .push({ pathname: ROUTES.LOGIN, query: { from: router.route } })
        .catch((error_) => logger.error('Failed redirect', error_))
    }
  }, [isAuth, router])

  const verifyIdentityAndRefreshUserData = async (
    rc: string,
    idCard: string,
    turnstileToken: string,
  ) => {
    setLastRc(rc)
    setLastIdCard(idCard)
    const result = await verifyIdentity(rc, idCard, turnstileToken)
    if (result) {
      // give the queue a few seconds to process the verification
      await new Promise((resolve) => {
        setTimeout(resolve, 8000)
      })
      // status will be set according to current cognito tier - pending if still processing
      await refreshUserData()
    }
  }

  return (
    <PageWrapper locale={page.locale} localizations={page.localizations}>
      <LoginRegisterLayout backButtonHidden>
        <AccountContainer className="md:pt-6 pt-0 mb-0 md:mb-8">
          {status === AccountStatus.IdentityVerificationRequired && (
            <IdentityVerificationForm onSubmit={verifyIdentityAndRefreshUserData} error={error} />
          )}
          {status === AccountStatus.IdentityVerificationFailed && (
            <IdentityVerificationForm onSubmit={verifyIdentityAndRefreshUserData} error={error} />
          )}
          {status === AccountStatus.IdentityVerificationPending && (
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
          {status === AccountStatus.IdentityVerificationSuccess && (
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

export default IdentityVerificationPage
