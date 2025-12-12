import {
  getTaxAdministratorForUser,
  StrapiTaxAdministrator,
} from '@backend/utils/strapi-tax-administrator'
import { strapiClient } from '@clients/graphql-strapi'
import { TaxFragment } from '@clients/graphql-strapi/api'
import { taxClient } from '@clients/tax'
import { dehydrate, DehydratedState, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { AuthSession } from 'aws-amplify/auth'
import { fetchUserAttributes } from 'aws-amplify/auth/server'
import { isAxiosError } from 'axios'
import TaxesFeesSection from 'components/forms/segments/AccountSections/TaxesFees/TaxesFeesSection/TaxesFeesSection'
import { AccountType } from 'frontend/dtos/accountDto'
import { ResponseGetTaxesListDto, TaxType } from 'openapi-clients/tax'

import { StrapiTaxProvider } from '../../components/forms/segments/AccountSections/TaxesFees/useStrapiTax'
import { TaxFeesSectionProvider } from '../../components/forms/segments/AccountSections/TaxesFees/useTaxFeesSection'
import AccountPageLayout from '../../components/layouts/AccountPageLayout'
import { SsrAuthProviderHOC } from '../../components/logic/SsrAuthContext'
import { prefetchUserQuery } from '../../frontend/hooks/useUser'
import { amplifyGetServerSideProps } from '../../frontend/utils/amplifyServer'
import { slovakServerSideTranslations } from '../../frontend/utils/slovakServerSideTranslations'

type AccountTaxesFeesPageProps = {
  taxesData: ResponseGetTaxesListDto | null
  strapiTaxAdministrator: StrapiTaxAdministrator | null
  strapiTax: TaxFragment
  dehydratedState: DehydratedState
}

/**
 * BE returns 403 if users identity is not verified, it should return a flag instead
 */
const getTaxes = async (getSsrAuthSession: () => Promise<AuthSession>) => {
  try {
    const { data } = await taxClient.taxControllerV2GetTaxesListV2(TaxType.Dzn, {
      authStrategy: 'authOnly',
      getSsrAuthSession,
    })
    return data
  } catch (error) {
    if (
      isAxiosError(error) &&
      error.response?.status === 403 &&
      // TODO: This should be replace with a proper error code (which is not returned)
      error.response?.data?.message === 'Forbidden tier'
    ) {
      return null
    }
    throw error
  }
}

export const getServerSideProps = amplifyGetServerSideProps<AccountTaxesFeesPageProps>(
  async ({ amplifyContextSpec, fetchAuthSession }) => {
    const queryClient = new QueryClient()

    try {
      const [taxesData, strapiTaxAdministrator, strapiTax, accountType] = await Promise.all([
        getTaxes(fetchAuthSession),
        getTaxAdministratorForUser(amplifyContextSpec),
        strapiClient.Tax().then((response) => response.tax?.data?.attributes),
        fetchUserAttributes(amplifyContextSpec).then(
          (response) => response?.['custom:account_type'],
        ),
        prefetchUserQuery(queryClient, fetchAuthSession),
      ])

      // Hide taxes and fees section for legal entities
      if (
        accountType === AccountType.FyzickaOsobaPodnikatel ||
        accountType === AccountType.PravnickaOsoba
      )
        return { notFound: true }

      if (!strapiTax) {
        return { notFound: true }
      }

      return {
        props: {
          taxesData,
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
  taxesData,
  strapiTaxAdministrator,
  strapiTax,
  dehydratedState,
}: AccountTaxesFeesPageProps) => {
  return (
    <HydrationBoundary state={dehydratedState}>
      <AccountPageLayout>
        <StrapiTaxProvider strapiTax={strapiTax}>
          <TaxFeesSectionProvider
            taxesData={taxesData}
            strapiTaxAdministrator={strapiTaxAdministrator}
          >
            <TaxesFeesSection />
          </TaxFeesSectionProvider>
        </StrapiTaxProvider>
      </AccountPageLayout>
    </HydrationBoundary>
  )
}

export default SsrAuthProviderHOC(AccountTaxesFeesPage)
