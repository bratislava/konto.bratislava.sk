import AccountContainer from 'components/forms/segments/AccountContainer/AccountContainer'
import AccountSuccessAlert from 'components/forms/segments/AccountSuccessAlert/AccountSuccessAlert'
import LoginRegisterLayout from 'components/layouts/LoginRegisterLayout'
import useSSORedirect from 'frontend/hooks/useSSORedirect'
import { GetServerSidePropsContext } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useEffect } from 'react'

import PageWrapper from '../components/layouts/PageWrapper'
import useAccount from '../frontend/hooks/useAccount'
import { isProductionDeployment } from '../frontend/utils/general'
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
      isProductionDeployment: isProductionDeployment(),
      ...(await serverSideTranslations(locale)),
    },
  }
}

const LogoutPage = ({ page }: AsyncServerProps<typeof getServerSideProps>) => {
  const { t } = useTranslation('account')
  const { logout, isAuth } = useAccount()
  const { redirect } = useSSORedirect()
  useEffect(() => {
    if (!isAuth) {
      redirect()
    }
  }, [isAuth, redirect])

  // TODO replace AccountSuccessAlert with something more fitting
  return (
    <PageWrapper locale={page.locale} localizations={page.localizations}>
      <LoginRegisterLayout backButtonHidden>
        <AccountContainer className="md:pt-6 pt-0 mb-0 md:mb-8">
          <AccountSuccessAlert
            title={t('logout_page.title')}
            description={t('logout_page.description')}
            confirmLabel={t('logout_page.confirm_label')}
            onConfirm={() => logout()}
            cancelLabel={t('logout_page.cancel_label')}
            onCancel={() => redirect()}
          />
        </AccountContainer>
      </LoginRegisterLayout>
    </PageWrapper>
  )
}

export default LogoutPage
