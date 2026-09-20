import { useTranslation } from 'next-i18next/pages'

import { strapiClient } from '@/src/clients/graphql-strapi'
import { GeneralQuery, HelpPageFragment } from '@/src/clients/graphql-strapi/api'
import PageLayout from '@/src/components/layouts/PageLayout'
import { GeneralContextProvider } from '@/src/components/logic/GeneralContextProvider'
import { SsrAuthProviderHOC } from '@/src/components/logic/SsrAuthContext'
import HelpPageContent from '@/src/components/page-contents/HelpPageContent/HelpPageContent'
import SeoHead from '@/src/components/simple-components/SeoHead'
import { amplifyGetServerSideProps } from '@/src/frontend/utils/amplifyServer'
import { slovakServerSideTranslations } from '@/src/frontend/utils/slovakServerSideTranslations'

type AccountHelpPageProps = {
  helpPage: HelpPageFragment
  general: GeneralQuery
}

export const getServerSideProps = amplifyGetServerSideProps<AccountHelpPageProps>(async () => {
  const [general, { helpPage }] = await Promise.all([
    strapiClient.General(),
    strapiClient.HelpPage(),
  ])

  if (!helpPage) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      general,
      helpPage,
      ...(await slovakServerSideTranslations()),
    },
  }
})

const AccountHelpPage = ({ general, helpPage }: AccountHelpPageProps) => {
  const { t } = useTranslation()

  return (
    <GeneralContextProvider general={general}>
      <>
        <SeoHead title={t('HelpPageContent.title')} />

        <PageLayout>
          <HelpPageContent helpPage={helpPage} />
        </PageLayout>
      </>
    </GeneralContextProvider>
  )
}

export default SsrAuthProviderHOC(AccountHelpPage)
