import UserProfileView from 'components/forms/segments/UserProfile/UserProfileView'
import { getSSRCurrentAuth } from 'frontend/utils/amplify'
import { GetServerSidePropsContext } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import AccountSectionHeader from '../components/forms/segments/AccountSectionHeader/AccountSectionHeader'
import AccountPageLayout from '../components/layouts/AccountPageLayout'
import PageWrapper from '../components/layouts/PageWrapper'
import { isProductionDeployment } from '../frontend/utils/general'
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
      isProductionDeploy: isProductionDeployment(),
      ...(await serverSideTranslations(locale)),
    },
  }
}

const MojProfil = ({ page, isProductionDeploy }: AsyncServerProps<typeof getServerSideProps>) => {
  const { t } = useTranslation('account')

  return (
    <PageWrapper locale={page.locale} localizations={page.localizations}>
      <AccountPageLayout isProductionDeploy={isProductionDeploy}>
        <AccountSectionHeader title={t('my_profile')} />
        <UserProfileView />
      </AccountPageLayout>
    </PageWrapper>
  )
}

export default MojProfil
