import ThankYouSection from 'components/forms/segments/AccountSections/ThankYouSection/ThankYouSection'
import AccountPageLayout from 'components/layouts/AccountPageLayout'
import PageWrapper from 'components/layouts/PageWrapper'
import { getSSRCurrentAuth } from 'frontend/utils/amplify'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { isProductionDeployment } from '../../frontend/utils/general'
import { AsyncServerProps } from '../../frontend/utils/types'

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

const AccountThankYouPage = ({
  page,
  isProductionDeploy,
}: AsyncServerProps<typeof getServerSideProps>) => {
  return (
    <PageWrapper locale={page.locale} localizations={page.localizations}>
      <AccountPageLayout
        isProductionDeploy={isProductionDeploy}
        hiddenHeaderNav
        className="bg-gray-50"
      >
        <ThankYouSection />
      </AccountPageLayout>
    </PageWrapper>
  )
}

export default AccountThankYouPage
