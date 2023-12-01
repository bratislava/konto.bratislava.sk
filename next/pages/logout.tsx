import { Auth } from 'aws-amplify'
import AccountContainer from 'components/forms/segments/AccountContainer/AccountContainer'
import AccountSuccessAlert from 'components/forms/segments/AccountSuccessAlert/AccountSuccessAlert'
import LoginRegisterLayout from 'components/layouts/LoginRegisterLayout'
import {
  getSSRCurrentAuth,
  ServerSideAuthProviderHOC,
} from 'components/logic/ServerSideAuthProvider'
import useLoginRegisterRedirect from 'frontend/hooks/useLoginRegisterRedirect'
import { useServerSideAuth } from 'frontend/hooks/useServerSideAuth'
import { GENERIC_ERROR_MESSAGE } from 'frontend/utils/errors'
import logger from 'frontend/utils/logger'
import { GetServerSidePropsContext } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useEffect, useState } from 'react'

import PageWrapper from '../components/layouts/PageWrapper'
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

const LogoutPage = ({ page }: AsyncServerProps<typeof getServerSideProps>) => {
  const { t } = useTranslation('account')
  const { isAuthenticated } = useServerSideAuth()
  const { redirect } = useLoginRegisterRedirect()
  const [isLoading, setIsLoading] = useState(false)
  useEffect(() => {
    if (!isAuthenticated) {
      redirect().catch((error) => logger.error('Failed redirect logout useEffect', error))
    }
  }, [isAuthenticated, redirect])

  const logoutHandler = async () => {
    setIsLoading(true)
    try {
      await Auth.signOut()
      await redirect()
    } catch (error) {
      logger.error(`${GENERIC_ERROR_MESSAGE} logout screen`, error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageWrapper locale={page.locale} localizations={page.localizations}>
      <LoginRegisterLayout backButtonHidden>
        <AccountContainer className="mb-0 pt-0 md:mb-8 md:pt-6">
          <AccountSuccessAlert
            title={t('logout_page.title')}
            description={t('logout_page.description')}
            confirmLabel={t('logout_page.confirm_label')}
            onConfirm={logoutHandler}
            confirmIsLoading={isLoading}
            cancelLabel={t('logout_page.cancel_label')}
            onCancel={() => redirect()}
          />
        </AccountContainer>
      </LoginRegisterLayout>
    </PageWrapper>
  )
}

export default ServerSideAuthProviderHOC(LogoutPage)
