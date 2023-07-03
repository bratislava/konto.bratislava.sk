import { Auth } from 'aws-amplify'
import AccountContainer from 'components/forms/segments/AccountContainer/AccountContainer'
import AccountSuccessAlert from 'components/forms/segments/AccountSuccessAlert/AccountSuccessAlert'
import LoginRegisterLayout from 'components/layouts/LoginRegisterLayout'
import {
  ServerSideAuthProviderHOC,
  getSSRCurrentAuth,
} from 'components/logic/ServerSideAuthProvider'
import useSSORedirect from 'frontend/hooks/useSSORedirect'
import logger from 'frontend/utils/logger'
import { GetServerSidePropsContext } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useEffect } from 'react'

import PageWrapper from '../components/layouts/PageWrapper'
import { isProductionDeployment } from '../frontend/utils/general'
import { AsyncServerProps } from '../frontend/utils/types'
import { useDerivedServerSideAuthState } from 'frontend/hooks/useServerSideAuth'

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
      isProductionDeployment: isProductionDeployment(),
      ...(await serverSideTranslations(locale)),
    },
  }
}

const LogoutPage = ({ page }: AsyncServerProps<typeof getServerSideProps>) => {
  const { t } = useTranslation('account')
  const { isAuthenticated } = useDerivedServerSideAuthState()
  const { redirect } = useSSORedirect()
  useEffect(() => {
    if (!isAuthenticated) {
      redirect().catch((error) => logger.error('Failed redirect logout useEffect', error))
    }
  }, [isAuthenticated, redirect])

  // TODO replace AccountSuccessAlert with something more fitting
  return (
    <PageWrapper locale={page.locale} localizations={page.localizations}>
      <LoginRegisterLayout backButtonHidden>
        <AccountContainer className="md:pt-6 pt-0 mb-0 md:mb-8">
          <AccountSuccessAlert
            title={t('logout_page.title')}
            description={t('logout_page.description')}
            confirmLabel={t('logout_page.confirm_label')}
            onConfirm={() => Auth.signOut()}
            cancelLabel={t('logout_page.cancel_label')}
            onCancel={() => redirect()}
          />
        </AccountContainer>
      </LoginRegisterLayout>
    </PageWrapper>
  )
}

export default ServerSideAuthProviderHOC(LogoutPage)
