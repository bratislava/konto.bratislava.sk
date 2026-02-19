import { strapiClient } from '@/src/clients/graphql-strapi'
import { TaxFragment } from '@/src/clients/graphql-strapi/api'
import { StrapiTaxProvider } from '@/src/components/forms/segments/AccountSections/TaxesFees/useStrapiTax'
import ThankYouSection from '@/src/components/forms/segments/AccountSections/ThankYouSection/ThankYouSection'
import PageLayout from '@/src/components/layouts/PageLayout'
import { SsrAuthProviderHOC } from '@/src/components/logic/SsrAuthContext'
import { amplifyGetServerSideProps } from '@/src/frontend/utils/amplifyServer'
import { slovakServerSideTranslations } from '@/src/frontend/utils/slovakServerSideTranslations'

export const getServerSideProps = amplifyGetServerSideProps(async () => {
  const strapiTax = await strapiClient.Tax().then((response) => response.tax?.data?.attributes)
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
        <ThankYouSection />
      </StrapiTaxProvider>
    </PageLayout>
  )
}

export default SsrAuthProviderHOC(AccountThankYouPage)
