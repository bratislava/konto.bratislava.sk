import { dehydrate, DehydratedState, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { useTranslation } from 'next-i18next/pages'
import { TaxControllerV2GetTaxDetailByYearV2200Response } from 'openapi-clients/tax'

import {
  getTaxAdministratorForUser,
  StrapiTaxAdministrator,
} from '@/src/backend/utils/strapi-tax-administrator'
import { strapiClient } from '@/src/clients/graphql-strapi'
import { GeneralQuery, MunicipalChargeConfigFragment } from '@/src/clients/graphql-strapi/api'
import { taxClient } from '@/src/clients/tax'
import PageLayout from '@/src/components/layouts/PageLayout'
import { GeneralContextProvider } from '@/src/components/logic/GeneralContextProvider'
import { SsrAuthProviderHOC } from '@/src/components/logic/SsrAuthContext'
import TaxPaymentPageContent from '@/src/components/page-contents/TaxesPageContent/TaxPaymentPageContent/TaxPaymentPageContent'
import { StrapiTaxAdministratorProvider } from '@/src/components/page-contents/TaxesPageContent/useStrapiTaxAdministrator'
import { StrapiTaxConfigProvider } from '@/src/components/page-contents/TaxesPageContent/useStrapiTaxConfig'
import { TaxDataProvider } from '@/src/components/page-contents/TaxesPageContent/useTaxData'
import { prefetchUserQuery } from '@/src/frontend/hooks/useUser'
import { amplifyGetServerSideProps } from '@/src/frontend/utils/amplifyServer'
import { convertYearToNumber } from '@/src/frontend/utils/general'
import { slovakServerSideTranslations } from '@/src/frontend/utils/slovakServerSideTranslations'
import { TaxRouteProps } from '@/src/utils/routes'

type PageProps = {
  general: GeneralQuery
  taxData: TaxControllerV2GetTaxDetailByYearV2200Response
  strapiTaxAdministrator: StrapiTaxAdministrator | null
  strapiTaxConfig: MunicipalChargeConfigFragment | null | undefined
  dehydratedState: DehydratedState
}

type Params = Record<keyof TaxRouteProps, string>

export const getServerSideProps = amplifyGetServerSideProps<PageProps, Params>(
  async ({ amplifyContextSpec, context, fetchAuthSession }) => {
    // TODO Unify with same param logic from [year]/[type]/[order]/index.tsx
    if (!context.params) {
      return { notFound: true }
    }

    const { year, type, order } = context.params

    const yearNumber = convertYearToNumber(year)

    if (!yearNumber) {
      return { notFound: true }
    }

    const orderNumber = Number(order)

    if (!orderNumber) {
      return { notFound: true }
    }

    const queryClient = new QueryClient()

    try {
      const [general, { data: taxData }, strapiTaxConfig, strapiTaxAdministrator] =
        await Promise.all([
          strapiClient.General(),
          taxClient.taxControllerV2GetTaxDetailByYearV2(yearNumber, orderNumber, type, {
            authStrategy: 'authOnly',
            getSsrAuthSession: fetchAuthSession,
          }),
          strapiClient.MunicipalChargeConfig().then((response) => response.municipalChargeConfig),
          getTaxAdministratorForUser(amplifyContextSpec),
        ])

      await prefetchUserQuery(queryClient, fetchAuthSession)

      return {
        props: {
          general,
          taxData,
          strapiTaxConfig,
          strapiTaxAdministrator: strapiTaxAdministrator ?? null,
          dehydratedState: dehydrate(queryClient),
          ...(await slovakServerSideTranslations()),
        },
      }
    } catch (error) {
      // TAXYEAR_OR_USER_NOT_FOUND
      if (isAxiosError(error)) {
        const is422Error = error.response?.status === 422
        // The user is not verified, the BE returns 403, but it means that the tax doesn't exist
        const isForbiddenTierError =
          error.response?.status === 403 &&
          // TODO: This should be replaced with a proper error code (which is not returned)
          error.response?.data?.message === 'Forbidden tier'

        if (is422Error || isForbiddenTierError) {
          return { notFound: true }
        }
      }

      throw error
    }
  },
  { requiresSignIn: true },
)

const TaxPaymentPage = ({
  general,
  taxData,
  strapiTaxConfig,
  strapiTaxAdministrator,
  dehydratedState,
}: PageProps) => {
  const { t } = useTranslation()

  return (
    <HydrationBoundary state={dehydratedState}>
      <GeneralContextProvider general={general}>
        <TaxDataProvider taxData={taxData}>
          <StrapiTaxConfigProvider strapiTaxConfig={strapiTaxConfig}>
            <StrapiTaxAdministratorProvider strapiTaxAdministrator={strapiTaxAdministrator}>
              <PageLayout title={t('TaxesPageContent.title')}>
                <TaxPaymentPageContent />
              </PageLayout>
            </StrapiTaxAdministratorProvider>
          </StrapiTaxConfigProvider>
        </TaxDataProvider>
      </GeneralContextProvider>
    </HydrationBoundary>
  )
}

export default SsrAuthProviderHOC(TaxPaymentPage)
