import { strapiClient } from '@clients/graphql-strapi'
import { TaxFragment } from '@clients/graphql-strapi/api'
import ThankYouSection from 'components/forms/segments/AccountSections/ThankYouSection/ThankYouSection'
import PageLayout from 'components/layouts/PageLayout'

import { StrapiTaxProvider } from '../../components/forms/segments/AccountSections/TaxesFees/useStrapiTax'
import { SsrAuthProviderHOC } from '../../components/logic/SsrAuthContext'
import { amplifyGetServerSideProps } from '../../frontend/utils/amplifyServer'
import { slovakServerSideTranslations } from '../../frontend/utils/slovakServerSideTranslations'

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
