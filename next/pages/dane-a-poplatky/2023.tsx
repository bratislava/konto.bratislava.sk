import AccountPageLayout from 'components/layouts/AccountPageLayout'
import PageWrapper from 'components/layouts/PageWrapper'
import { getSSRCurrentAuth } from 'frontend/utils/amplify'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import TaxFeeSection from '../../components/forms/segments/AccountSections/TaxesFeesSection/TaxFeeSection'
import { isProductionDeployment as isProductionDeploymentFn } from '../../frontend/utils/general'
import { AsyncServerProps } from '../../frontend/utils/types'

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const locale = ctx.locale ?? 'sk'

  return {
    props: {
      auth: await getSSRCurrentAuth(ctx.req),
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
      isProductionDeployment: isProductionDeploymentFn(),
    },
  }
}

const AccountTaxesFeesPage = ({
  page,
  auth,
  isProductionDeployment,
}: AsyncServerProps<typeof getServerSideProps>) => {
  return (
    <PageWrapper locale={page.locale} localizations={page.localizations} auth={auth}>
      <AccountPageLayout isProductionDeploy={isProductionDeployment}>
        <TaxFeeSection isProductionDeployment={isProductionDeployment} />
      </AccountPageLayout>
    </PageWrapper>
  )
}

export default AccountTaxesFeesPage
