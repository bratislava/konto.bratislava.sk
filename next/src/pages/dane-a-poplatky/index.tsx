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
import { GeneralQuery, TaxFragment } from '@/src/clients/graphql-strapi/api'
import { taxClient } from '@/src/clients/tax'
import PageLayout from '@/src/components/layouts/PageLayout'
import { GeneralContextProvider } from '@/src/components/logic/GeneralContextProvider'
import { SsrAuthProviderHOC } from '@/src/components/logic/SsrAuthContext'
import TaxesFeesPageContent from '@/src/components/page-contents/TaxesFees/TaxesFeesPageContent/TaxesFeesPageContent'
import { StrapiTaxProvider } from '@/src/components/page-contents/TaxesFees/useStrapiTax'
import { TaxesFeesProvider } from '@/src/components/page-contents/TaxesFees/useTaxesFees'
import { AccountType } from '@/src/frontend/dtos/accountDto'
import { prefetchUserQuery } from '@/src/frontend/hooks/useUser'
import { amplifyGetServerSideProps } from '@/src/frontend/utils/amplifyServer'
import { slovakServerSideTranslations } from '@/src/frontend/utils/slovakServerSideTranslations'

export type TaxesData = ResponseGetTaxesListDto

export type AccountTaxesFeesPageProps = {
  general: GeneralQuery
  taxesData: Record<TaxType, TaxesData | null>
  strapiTaxAdministrator: StrapiTaxAdministrator | null
  strapiTax: TaxFragment | null | undefined
  dehydratedState: DehydratedState
}

/**
 * BE returns 403 if users identity is not verified, it should return a flag instead
 */
const getTaxes = async (getSsrAuthSession: () => Promise<AuthSession>, taxType: TaxType) => {
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

export const getServerSideProps = amplifyGetServerSideProps<AccountTaxesFeesPageProps>(
  async ({ amplifyContextSpec, fetchAuthSession }) => {
    try {
      const [general, taxesDataDzn, taxesDataKo, strapiTaxAdministrator, strapiTax, accountType] =
        await Promise.all([
          strapiClient.General(),
          getTaxes(fetchAuthSession, TaxType.Dzn),
          getTaxes(fetchAuthSession, TaxType.Ko),
          getTaxAdministratorForUser(amplifyContextSpec),
          strapiClient.Tax().then((response) => response.tax),
          fetchUserAttributes(amplifyContextSpec).then(
            (response) => response?.['custom:account_type'],
          ),
        ])

      await prefetchUserQuery(queryClient, fetchAuthSession)

      // Hide taxes and fees section for legal entities
      if (
        accountType === AccountType.FyzickaOsobaPodnikatel ||
        accountType === AccountType.PravnickaOsoba
      )
        return { notFound: true }

      return {
        props: {
          general,
          taxesData: { [TaxType.Dzn]: taxesDataDzn, [TaxType.Ko]: taxesDataKo },
          strapiTaxAdministrator: strapiTaxAdministrator ?? null,
          dehydratedState: dehydrate(queryClient),
          strapiTax,
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

const AccountTaxesFeesPage = ({
  general,
  taxesData,
  strapiTaxAdministrator,
  strapiTax,
  dehydratedState,
}: AccountTaxesFeesPageProps) => {
  return (
    <HydrationBoundary state={dehydratedState}>
      <GeneralContextProvider general={general}>
        <PageLayout>
          <StrapiTaxProvider strapiTax={strapiTax}>
            <TaxesFeesProvider
              taxesData={taxesData}
              strapiTaxAdministrator={strapiTaxAdministrator}
            >
              <TaxesFeesPageContent />
            </TaxesFeesProvider>
          </StrapiTaxProvider>
        </PageLayout>
      </GeneralContextProvider>
    </HydrationBoundary>
  )
}

export default SsrAuthProviderHOC(AccountTaxesFeesPage)
