import AccountActivator from 'components/forms/segments/AccountActivator/AccountActivator'
import AccountContainer from 'components/forms/segments/AccountContainer/AccountContainer'
import AccountMarkdown from 'components/forms/segments/AccountMarkdown/AccountMarkdown'
import AccountSuccessAlert from 'components/forms/segments/AccountSuccessAlert/AccountSuccessAlert'
import EmailVerificationForm from 'components/forms/segments/EmailVerificationForm/EmailVerificationForm'
import RegisterForm from 'components/forms/segments/RegisterForm/RegisterForm'
import LoginRegisterLayout from 'components/layouts/LoginRegisterLayout'
import useSSORedirect from 'frontend/hooks/useSSORedirect'
import { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import PageWrapper from '../components/layouts/PageWrapper'
import { ROUTES } from '../frontend/api/constants'
import useAccount, { AccountStatus } from '../frontend/hooks/useAccount'
import { isProductionDeployment } from '../frontend/utils/general'
import logger from '../frontend/utils/logger'
import { formatUnicorn } from '../frontend/utils/string'
import { AsyncServerProps } from '../frontend/utils/types'

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
      isProductionDeploy: isProductionDeployment(),
      ...(await serverSideTranslations(locale)),
    },
  }
}

const RegisterPage = ({
  page,
  isProductionDeploy,
}: AsyncServerProps<typeof getServerSideProps>) => {
  const { t } = useTranslation('account')
  const { signUp, resendVerificationCode, verifyEmail, error, status, lastEmail, setStatus } =
    useAccount()
  const router = useRouter()
  const { redirect, redirectTargetIsAnotherPage } = useSSORedirect()
  // only divert user from verification if he's coming from another site
  const preVerificationRedirect = redirectTargetIsAnotherPage

  return (
    <PageWrapper locale={page.locale} localizations={page.localizations}>
      <LoginRegisterLayout backButtonHidden>
        {status === AccountStatus.Idle && <AccountActivator />}
        <AccountContainer className="md:pt-6 pt-0 mb-0 md:mb-8">
          {status === AccountStatus.Idle ? (
            <RegisterForm
              lastEmail={lastEmail}
              onSubmit={signUp}
              error={error}
              disablePO={isProductionDeploy}
            />
          ) : status === AccountStatus.EmailVerificationRequired ? (
            <EmailVerificationForm
              lastEmail={lastEmail}
              onResend={resendVerificationCode}
              onSubmit={verifyEmail}
              error={error}
            />
          ) : preVerificationRedirect ? (
            <AccountSuccessAlert
              title={t('register_success_title')}
              description={formatUnicorn(t('register_success_description'), {
                email: lastEmail,
              })}
              confirmLabel={t('identity_verification_link')}
              onConfirm={async () => {
                // this does some black magic and needs to be fixed, until that - without changing the status before redirect the user won't stay logged in
                setStatus(AccountStatus.IdentityVerificationRequired)
                await new Promise((resolve) => {
                  setTimeout(resolve, 1000)
                })
                redirect()
              }}
            />
          ) : (
            <AccountSuccessAlert
              title={t('register_success_title')}
              description={formatUnicorn(t('register_success_description'), {
                email: lastEmail,
              })}
              confirmLabel={t('identity_verification_link')}
              onConfirm={() => {
                setStatus(AccountStatus.IdentityVerificationRequired)
                router
                  .push(ROUTES.IDENTITY_VERIFICATION)
                  .catch((error_) => logger.error('Failed redirect', error_))
              }}
              cancelLabel={t('identity_verification_skip')}
              onCancel={() =>
                router.push({ pathname: ROUTES.HOME, query: { from: ROUTES.REGISTER } })
              }
            >
              <AccountMarkdown
                className="text-center"
                content={t('register_success_content')}
                variant="sm"
              />
            </AccountSuccessAlert>
          )}
        </AccountContainer>
      </LoginRegisterLayout>
    </PageWrapper>
  )
}

export default RegisterPage
