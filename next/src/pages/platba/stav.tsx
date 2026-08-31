import { useTranslation } from 'next-i18next/pages'

import { strapiClient } from '@/src/clients/graphql-strapi'
import { GeneralQuery, MunicipalChargeConfigFragment } from '@/src/clients/graphql-strapi/api'
import PageLayout from '@/src/components/layouts/PageLayout'
import { GeneralContextProvider } from '@/src/components/logic/GeneralContextProvider'
import { SsrAuthProviderHOC } from '@/src/components/logic/SsrAuthContext'
import PaymentResultPageContent from '@/src/components/page-contents/PaymentResultPageContent/PaymentResultPageContent'
import { StrapiTaxConfigProvider } from '@/src/components/page-contents/TaxesPageContent/useStrapiTaxConfig'
import SeoHead from '@/src/components/simple-components/SeoHead'
import { amplifyGetServerSideProps } from '@/src/frontend/utils/amplifyServer'
import { slovakServerSideTranslations } from '@/src/frontend/utils/slovakServerSideTranslations'

type Props = {
  general: GeneralQuery
  strapiTaxConfig: MunicipalChargeConfigFragment
}

export const getServerSideProps = amplifyGetServerSideProps(async () => {
  const [general, strapiTaxConfig] = await Promise.all([
    strapiClient.General(),
    strapiClient.MunicipalChargeConfig().then((response) => response.municipalChargeConfig),
  ])

  if (!strapiTaxConfig) {
    return { notFound: true }
  }

  return {
    props: {
      general,
      strapiTaxConfig,
      ...(await slovakServerSideTranslations()),
    },
  }
})

const PaymentResultPage = ({ general, strapiTaxConfig }: Props) => {
  const { t } = useTranslation()

  return (
    <GeneralContextProvider general={general}>
      <StrapiTaxConfigProvider strapiTaxConfig={strapiTaxConfig}>
        <>
          <SeoHead title={t('platba.stav.title')} />

          <PageLayout className="lg:bg-gray-50">
            <PaymentResultPageContent />
          </PageLayout>
        </>
      </StrapiTaxConfigProvider>
    </GeneralContextProvider>
  )
}

export default SsrAuthProviderHOC(PaymentResultPage)
