import { AsyncServerProps } from '../../frontend/types'
import { isProductionDeployment as isProductionDeploymentFn } from '../../frontend/utils'
import AccountPageLayout from 'components/layouts/AccountPageLayout'
import PageWrapper from 'components/layouts/PageWrapper'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import TaxFeeSection from '../../components/forms/segments/AccountSections/TaxesFeesSection/TaxFeeSection'

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
      ...(await serverSideTranslations(locale)),
      isProductionDeployment: isProductionDeploymentFn(),
    },
  }
}

const AccountTaxesFeesPage = ({
  page,
  isProductionDeployment,
}: AsyncServerProps<typeof getServerSideProps>) => {
  return (
    <PageWrapper locale={page.locale} localizations={page.localizations}>
      <AccountPageLayout isProductionDeploy={isProductionDeployment}>
        <TaxFeeSection isProductionDeployment={isProductionDeployment} />
      </AccountPageLayout>
    </PageWrapper>
  )
}

export default AccountTaxesFeesPage
