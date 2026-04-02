import { strapiClient } from '@/src/clients/graphql-strapi'
import { TaxFragment } from '@/src/clients/graphql-strapi/api'
import PageLayout from '@/src/components/layouts/PageLayout'
import { SsrAuthProviderHOC } from '@/src/components/logic/SsrAuthContext'
import { StrapiTaxProvider } from '@/src/components/page-contents/TaxesFees/useStrapiTax'
import ThankYouPageContent from '@/src/components/page-contents/ThankYouPageContent/ThankYouPageContent'
import { amplifyGetServerSideProps } from '@/src/frontend/utils/amplifyServer'
import { slovakServerSideTranslations } from '@/src/frontend/utils/slovakServerSideTranslations'

export const getServerSideProps = amplifyGetServerSideProps(async () => {
  const strapiTax = await strapiClient.Tax().then((response) => response.tax)
  if (!strapiTax) {
    return { notFound: true }
  }

  return {
    props: {
      strapiTax,
      ...(await slovakServerSideTranslations()),
    },
  }
})

const AccountThankYouPage = ({ strapiTax }: { strapiTax: TaxFragment }) => {
  return (
    <PageLayout hideNavMenu className="md:bg-gray-50">
      <StrapiTaxProvider strapiTax={strapiTax}>
        <ThankYouPageContent />
      </StrapiTaxProvider>
    </PageLayout>
  )
}

export default SsrAuthProviderHOC(AccountThankYouPage)
