import { AsyncServerProps } from '../../frontend/types'
import { isProductionDeployment } from '../../frontend/utils'
import AccountPageLayout from 'components/layouts/AccountPageLayout'
import PageWrapper from 'components/layouts/PageWrapper'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import ThankYouFormSection from '../../components/forms/segments/AccountSections/ThankYouSection/ThankYouFormSection'

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  if (isProductionDeployment()) return { notFound: true }

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

const AccountThankYouFormPage = ({
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
        <ThankYouFormSection />
      </AccountPageLayout>
    </PageWrapper>
  )
}

export default AccountThankYouFormPage
