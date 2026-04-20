import { strapiClient } from '@/src/clients/graphql-strapi'
import { GeneralQuery, TaxFragment } from '@/src/clients/graphql-strapi/api'
import PageLayout from '@/src/components/layouts/PageLayout'
import { GeneralContextProvider } from '@/src/components/logic/GeneralContextProvider'
import { SsrAuthProviderHOC } from '@/src/components/logic/SsrAuthContext'
import { StrapiTaxProvider } from '@/src/components/page-contents/TaxesFees/useStrapiTax'
import ThankYouPageContent from '@/src/components/page-contents/ThankYouPageContent/ThankYouPageContent'
import { amplifyGetServerSideProps } from '@/src/frontend/utils/amplifyServer'
import { slovakServerSideTranslations } from '@/src/frontend/utils/slovakServerSideTranslations'

type AccountThankYouPageProps = {
  general: GeneralQuery
  strapiTax: TaxFragment
}

export const getServerSideProps = amplifyGetServerSideProps(async () => {
  const [general, strapiTax] = await Promise.all([
    strapiClient.General(),
    strapiClient.Tax().then((response) => response.tax),
  ])
  if (!strapiTax) {
    return { notFound: true }
  }

  return {
    props: {
      general,
      strapiTax,
      ...(await slovakServerSideTranslations()),
    },
  }
})

const AccountThankYouPage = ({ general, strapiTax }: AccountThankYouPageProps) => {
  return (
    <GeneralContextProvider general={general}>
      <PageLayout hideNavMenu className="md:bg-gray-50">
        <StrapiTaxProvider strapiTax={strapiTax}>
          <ThankYouPageContent />
        </StrapiTaxProvider>
      </PageLayout>
    </GeneralContextProvider>
  )
}

export default SsrAuthProviderHOC(AccountThankYouPage)
