import { dehydrate, DehydratedState, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { AuthSession } from 'aws-amplify/auth'
import { fetchUserAttributes } from 'aws-amplify/auth/server'
import { isAxiosError } from 'axios'
import { ResponseGetTaxesListDto, TaxType } from 'openapi-clients/tax'

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
import TaxesPageContent from '@/src/components/page-contents/TaxesPageContent/TaxesPageContent/TaxesPageContent'
import { StrapiTaxAdministratorProvider } from '@/src/components/page-contents/TaxesPageContent/useStrapiTaxAdministrator'
import { StrapiTaxConfigProvider } from '@/src/components/page-contents/TaxesPageContent/useStrapiTaxConfig'
import { TaxesDataProvider } from '@/src/components/page-contents/TaxesPageContent/useTaxesData'
import { AccountType } from '@/src/frontend/dtos/accountDto'
import { prefetchUserQuery } from '@/src/frontend/hooks/useUser'
import { amplifyGetServerSideProps } from '@/src/frontend/utils/amplifyServer'
import { slovakServerSideTranslations } from '@/src/frontend/utils/slovakServerSideTranslations'

export type TaxesData = ResponseGetTaxesListDto

export type TaxesPageProps = {
  general: GeneralQuery
  taxesData: Record<TaxType, TaxesData | null>
  strapiTaxAdministrator: StrapiTaxAdministrator | null
  strapiTaxConfig: MunicipalChargeConfigFragment | null | undefined
  dehydratedState: DehydratedState
}

/**
 * BE returns 403 if users identity is not verified, it should return a flag instead
 */
const getTaxesData = async (getSsrAuthSession: () => Promise<AuthSession>, taxType: TaxType) => {
  try {
    const { data } = await taxClient.taxControllerV2GetTaxesListV2(taxType, {
      authStrategy: 'authOnly',
      getSsrAuthSession,
    })

    return data
  } catch (error) {
    if (
      isAxiosError(error) &&
      error.response?.status === 403 &&
      // TODO: This should be replaced with a proper error code (which is not returned)
      error.response?.data?.message === 'Forbidden tier'
    ) {
      return null
    }
    throw error
  }
}

const queryClient = new QueryClient()

export const getServerSideProps = amplifyGetServerSideProps<TaxesPageProps>(
  async ({ amplifyContextSpec, fetchAuthSession }) => {
    try {
      const [
        general,
        taxesDataDzn,
        taxesDataKo,
        strapiTaxAdministrator,
        strapiTaxConfig,
        accountType,
      ] = await Promise.all([
        strapiClient.General(),
        getTaxesData(fetchAuthSession, TaxType.Dzn),
        getTaxesData(fetchAuthSession, TaxType.Ko),
        getTaxAdministratorForUser(amplifyContextSpec),
        strapiClient.MunicipalChargeConfig().then((response) => response.municipalChargeConfig),
        fetchUserAttributes(amplifyContextSpec).then(
          (response) => response?.['custom:account_type'],
        ),
      ])

      await prefetchUserQuery(queryClient, fetchAuthSession)

      // Hide taxes and fees section for legal entities
      if (
        accountType === AccountType.FyzickaOsobaPodnikatel ||
        accountType === AccountType.PravnickaOsoba
      ) {
        return { notFound: true }
      }

      return {
        props: {
          general,
          taxesData: { [TaxType.Dzn]: taxesDataDzn, [TaxType.Ko]: taxesDataKo },
          strapiTaxAdministrator: strapiTaxAdministrator ?? null,
          strapiTaxConfig,
          dehydratedState: dehydrate(queryClient),
          ...(await slovakServerSideTranslations()),
        },
      }
    } catch (error) {
      // TAXYEAR_OR_USER_NOT_FOUND
      if (isAxiosError(error) && error.response?.status === 422) {
        return { notFound: true }
      }

      throw error
    }
  },
  { requiresSignIn: true },
)

const TaxesPage = ({
  general,
  taxesData,
  strapiTaxAdministrator,
  strapiTaxConfig,
  dehydratedState,
}: TaxesPageProps) => {
  return (
    <HydrationBoundary state={dehydratedState}>
      <GeneralContextProvider general={general}>
        <TaxesDataProvider taxesData={taxesData}>
          <StrapiTaxConfigProvider strapiTaxConfig={strapiTaxConfig}>
            <StrapiTaxAdministratorProvider strapiTaxAdministrator={strapiTaxAdministrator}>
              <PageLayout>
                <TaxesPageContent />
              </PageLayout>
            </StrapiTaxAdministratorProvider>
          </StrapiTaxConfigProvider>
        </TaxesDataProvider>
      </GeneralContextProvider>
    </HydrationBoundary>
  )
}

export default SsrAuthProviderHOC(TaxesPage)
