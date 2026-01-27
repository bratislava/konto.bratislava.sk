import {
  getTaxAdministratorForUser,
  StrapiTaxAdministrator,
} from '@backend/utils/strapi-tax-administrator'
import { strapiClient } from '@clients/graphql-strapi'
import { TaxFragment } from '@clients/graphql-strapi/api'
import { taxClient } from '@clients/tax'
import { dehydrate, DehydratedState, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import TaxFeeSection from 'components/forms/segments/AccountSections/TaxesFees/TaxFeeSection/TaxFeeSection'
import { StrapiTaxProvider } from 'components/forms/segments/AccountSections/TaxesFees/useStrapiTax'
import { TaxFeeSectionProvider } from 'components/forms/segments/AccountSections/TaxesFees/useTaxFeeSection'
import AccountPageLayout from 'components/layouts/AccountPageLayout'
import { SsrAuthProviderHOC } from 'components/logic/SsrAuthContext'
import { TaxFeeRouteProps } from 'frontend/api/constants'
import { prefetchUserQuery } from 'frontend/hooks/useUser'
import { amplifyGetServerSideProps } from 'frontend/utils/amplifyServer'
import { convertYearToNumber } from 'frontend/utils/general'
import { slovakServerSideTranslations } from 'frontend/utils/slovakServerSideTranslations'
import { TaxControllerV2GetTaxDetailByYearV2200Response } from 'openapi-clients/tax'

type PageProps = {
  taxData: TaxControllerV2GetTaxDetailByYearV2200Response
  strapiTaxAdministrator: StrapiTaxAdministrator | null
  strapiTax: TaxFragment
  dehydratedState: DehydratedState
}

type Params = Record<keyof TaxFeeRouteProps, string>

export const getServerSideProps = amplifyGetServerSideProps<PageProps, Params>(
  async ({ amplifyContextSpec, context, fetchAuthSession }) => {
    // TODO Unify with same param logic from [year]/[type]/[order]/platba.tsx
    if (!context.params) {
      return { notFound: true }
    }

    const { year, type, order } = context.params

    const yearNumber = convertYearToNumber(year)

    if (!yearNumber) {
      return { notFound: true }
    }

    const orderNumber = +order

    if (!orderNumber) {
      return { notFound: true }
    }

    const queryClient = new QueryClient()

    try {
      const [{ data: taxData }, strapiTax, strapiTaxAdministrator] = await Promise.all([
        taxClient.taxControllerV2GetTaxDetailByYearV2(yearNumber, orderNumber, type, {
          authStrategy: 'authOnly',
          getSsrAuthSession: fetchAuthSession,
        }),
        strapiClient.Tax().then((response) => response.tax?.data?.attributes),
        getTaxAdministratorForUser(amplifyContextSpec),
        prefetchUserQuery(queryClient, fetchAuthSession),
      ])

      if (!strapiTax) {
        return { notFound: true }
      }

      return {
        props: {
          taxData,
          strapiTax,
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

const AccountTaxesFeesPage = ({
  taxData,
  strapiTax,
  dehydratedState,
  strapiTaxAdministrator,
}: PageProps) => {
  return (
    <HydrationBoundary state={dehydratedState}>
      <AccountPageLayout>
        <StrapiTaxProvider strapiTax={strapiTax}>
          <TaxFeeSectionProvider taxData={taxData} strapiTaxAdministrator={strapiTaxAdministrator}>
            <TaxFeeSection />
          </TaxFeeSectionProvider>
        </StrapiTaxProvider>
      </AccountPageLayout>
    </HydrationBoundary>
  )
}

export default SsrAuthProviderHOC(AccountTaxesFeesPage)
