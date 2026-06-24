import { strapiClient } from '@/src/clients/graphql-strapi'
import { GeneralQuery, MunicipalServiceEntityFragment } from '@/src/clients/graphql-strapi/api'
import PageLayout from '@/src/components/layouts/PageLayout'
import { GeneralContextProvider } from '@/src/components/logic/GeneralContextProvider'
import { SsrAuthProviderHOC } from '@/src/components/logic/SsrAuthContext'
import MunicipalServicePageContent from '@/src/components/page-contents/MunicipalServicePageContent/MunicipalServicePageContent'
import { amplifyGetServerSideProps } from '@/src/frontend/utils/amplifyServer'
import { slovakServerSideTranslations } from '@/src/frontend/utils/slovakServerSideTranslations'

type Props = {
  general: GeneralQuery
  municipalService: MunicipalServiceEntityFragment
}

// This page is temporarily implemented with hardcoded slug, to be able to show Towing landing page, that does not have related form (form definition)
// TODO Remove this hardcoded page, and use "municipal service" instead of "form landing page" for landing pages

export const getServerSideProps = amplifyGetServerSideProps<Props>(async () => {
  const [general, { municipalServices }] = await Promise.all([
    strapiClient.General(),
    strapiClient.MunicipalServiceBySlug({ slug: 'vyhladavanie-odtiahnutych-vozidiel' }),
  ])

  const municipalService = municipalServices[0]
  if (!municipalService) {
    return { notFound: true }
  }

  return {
    props: {
      general,
      municipalService,
      ...(await slovakServerSideTranslations()),
    },
  }
}, {})

const MunicipalServicesFormSplitPage = ({ general, ...props }: Props) => (
  <GeneralContextProvider general={general}>
    <PageLayout>
      <MunicipalServicePageContent {...props} />
    </PageLayout>
  </GeneralContextProvider>
)

export default SsrAuthProviderHOC(MunicipalServicesFormSplitPage)
