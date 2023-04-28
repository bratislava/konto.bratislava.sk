import { getAplicationData } from '@backend/utils/forms'
import logger from '@utils/logger'
import { AsyncServerProps } from '@utils/types'
import { isProductionDeployment } from '@utils/utils'
import MyApplicationDetails from 'components/forms/segments/AccountSections/MyApplicationsSection/MyApplicationDetails'
import AccountPageLayout from 'components/layouts/AccountPageLayout'
import PageWrapper from 'components/layouts/PageWrapper'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  if (isProductionDeployment()) return { notFound: true }
  const locale = ctx.locale ?? 'sk'

  let myAplicationData
  try {
    myAplicationData = getAplicationData(ctx.query.ziadost)
  } catch (error) {
    logger.error(error)
    return { notFound: true }
  }

  return {
    props: {
      myAplicationData,
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

const AccountMyApplicationsPage = ({
  page,
  myAplicationData,
  isProductionDeploy,
}: AsyncServerProps<typeof getServerSideProps>) => {
  return (
    <PageWrapper locale={page.locale} localizations={page.localizations}>
      <AccountPageLayout isProductionDeploy={isProductionDeploy}>
        <MyApplicationDetails data={myAplicationData} />
      </AccountPageLayout>
    </PageWrapper>
  )
}

export default AccountMyApplicationsPage
