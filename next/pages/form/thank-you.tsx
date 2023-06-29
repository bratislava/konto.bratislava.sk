import AccountPageLayout from 'components/layouts/AccountPageLayout'
import PageWrapper from 'components/layouts/PageWrapper'
import { getSSRCurrentAuth } from 'frontend/utils/amplify'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import ThankYouFormSection from '../../components/forms/segments/AccountSections/ThankYouSection/ThankYouFormSection'
import { isProductionDeployment } from '../../frontend/utils/general'
import { AsyncServerProps } from '../../frontend/utils/types'

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  if (isProductionDeployment()) return { notFound: true }

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
      isProductionDeploy: isProductionDeployment(),
      ...(await serverSideTranslations(locale)),
    },
  }
}

const AccountThankYouFormPage = ({
  page,
  auth,
  isProductionDeploy,
}: AsyncServerProps<typeof getServerSideProps>) => {
  return (
    <PageWrapper locale={page.locale} localizations={page.localizations} auth={auth}>
      <AccountPageLayout
        isProductionDeploy={isProductionDeploy}
        hiddenHeaderNav
        className="bg-gray-50"
      >
        <ThankYouFormSection />
      </AccountPageLayout>
    </PageWrapper>
  )
}

export default AccountThankYouFormPage
