import { getAplicationDetailsData, getAplicationHistoryData } from '@backend/utils/forms'
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

  let myAplicationDetailsData
  let myAplicationHistoryData
  try {
    myAplicationDetailsData = getAplicationDetailsData(ctx.query.ziadost)
    myAplicationHistoryData = getAplicationHistoryData()
  } catch (error) {
    logger.error(error)
    return { notFound: true }
  }

  return {
    props: {
      myAplicationDetailsData,
      myAplicationHistoryData,
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
  myAplicationDetailsData,
  myAplicationHistoryData,
  isProductionDeploy,
}: AsyncServerProps<typeof getServerSideProps>) => {
  return (
    <PageWrapper locale={page.locale} localizations={page.localizations}>
      <AccountPageLayout isProductionDeploy={isProductionDeploy}>
        <MyApplicationDetails
          historyData={myAplicationHistoryData}
          detailsData={myAplicationDetailsData}
        />
      </AccountPageLayout>
    </PageWrapper>
  )
}

export default AccountMyApplicationsPage
