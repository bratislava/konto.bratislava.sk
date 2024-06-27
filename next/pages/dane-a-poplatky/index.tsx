import {
  getTaxAdministratorForUser,
  StrapiTaxAdministrator,
} from '@backend/utils/tax-administrator'
import { strapiClient } from '@clients/graphql-strapi'
import { TaxFragment } from '@clients/graphql-strapi/api'
import { ResponseGetTaxesDto } from '@clients/openapi-tax'
import { taxApi } from '@clients/tax'
import { dehydrate, DehydratedState, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'

import TaxesFeesSection from '../../components/forms/segments/AccountSections/TaxesFeesSection/TaxesFeesSection'
import { TaxFeesSectionProvider } from '../../components/forms/segments/AccountSections/TaxesFeesSection/useTaxFeesSection'
import AccountPageLayout from '../../components/layouts/AccountPageLayout'
import { SsrAuthProviderHOC } from '../../components/logic/SsrAuthContext'
import { prefetchUserQuery } from '../../frontend/hooks/useUser'
import { amplifyGetServerSideProps } from '../../frontend/utils/amplifyServer'
import { slovakServerSideTranslations } from '../../frontend/utils/slovakServerSideTranslations'

type AccountTaxesFeesPageProps = {
  taxesData: ResponseGetTaxesDto
  taxAdministrator: StrapiTaxAdministrator | null
  strapiTax: TaxFragment
  dehydratedState: DehydratedState
}

/**
 * BE returns 403 if users identity is not verified, it should return a flag instead
 */
const getTaxes = async (getAccessToken: () => Promise<string | null>) => {
  try {
    const { data } = await taxApi.taxControllerGetArchivedTaxes({
      accessToken: 'always',
      accessTokenSsrGetFn: getAccessToken,
    })
    return data
  } catch (error) {
    if (
      isAxiosError(error) &&
      error.response?.status === 403 &&
      // TODO: This should be replace with a proper error code (which is not returned)
      error.response?.data?.message === 'Forbidden tier'
    ) {
      return { isInNoris: false, items: [] } as ResponseGetTaxesDto
    }
    throw error
  }
}

export const getServerSideProps = amplifyGetServerSideProps<AccountTaxesFeesPageProps>(
  async ({ amplifyContextSpec, getAccessToken }) => {
    const queryClient = new QueryClient()

    try {
      const [taxesData, taxAdministrator, strapiTax] = await Promise.all([
        getTaxes(getAccessToken),
        getTaxAdministratorForUser(amplifyContextSpec),
        strapiClient.Tax().then((response) => response.tax?.data?.attributes),
        prefetchUserQuery(queryClient, getAccessToken),
      ])

      if (!strapiTax) {
        return { notFound: true }
      }

      return {
        props: {
          taxesData,
          taxAdministrator: taxAdministrator ?? null,
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
  taxAdministrator,
  strapiTax,
  dehydratedState,
}: AccountTaxesFeesPageProps) => {
  return (
    <HydrationBoundary state={dehydratedState}>
      <AccountPageLayout>
        <TaxFeesSectionProvider
          taxesData={taxesData}
          taxAdministrator={taxAdministrator}
          strapiTax={strapiTax}
        >
          <TaxesFeesSection />
        </TaxFeesSectionProvider>
      </AccountPageLayout>
    </HydrationBoundary>
  )
}

export default SsrAuthProviderHOC(AccountTaxesFeesPage)
