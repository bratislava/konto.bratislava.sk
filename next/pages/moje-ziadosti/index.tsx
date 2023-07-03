import MyApplicationsSection from 'components/forms/segments/AccountSections/MyApplicationsSection/MyApplicationsSection'
import AccountPageLayout from 'components/layouts/AccountPageLayout'
import PageWrapper from 'components/layouts/PageWrapper'
import { getApplicationConceptList, getApplicationSentList } from 'frontend/api/mocks/mocks'
import logger from 'frontend/utils/logger'
import { AsyncServerProps } from 'frontend/utils/types'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { environment } from '../../environment'

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  if (!environment.featureToggles.forms) return { notFound: true }
  const locale = ctx.locale ?? 'sk'

  let myApplicationSentList
  let myApplicationConceptList
  try {
    myApplicationSentList = getApplicationSentList()
    myApplicationConceptList = getApplicationConceptList()
  } catch (error) {
    logger.error(error)
    return { notFound: true }
  }

  return {
    props: {
      myApplicationSentList,
      myApplicationConceptList,
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

const AccountMyApplicationsPage = ({
  page,
  myApplicationSentList,
  myApplicationConceptList,
}: AsyncServerProps<typeof getServerSideProps>) => {
  return (
    <PageWrapper locale={page.locale} localizations={page.localizations}>
      <AccountPageLayout>
        <MyApplicationsSection
          conceptCardsList={myApplicationConceptList}
          sentCardsList={myApplicationSentList}
        />
      </AccountPageLayout>
    </PageWrapper>
  )
}

export default AccountMyApplicationsPage
