import {
  getTaxAdministratorForUser,
  StrapiTaxAdministrator,
} from '@backend/utils/strapi-tax-administrator'
import { taxClient } from '@clients/tax'
import { dehydrate, DehydratedState, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import TaxFeePaymentSection from 'components/forms/segments/AccountSections/TaxesFees/TaxFeePaymentSection/TaxFeePaymentSection'
import { TaxFeeSectionProvider } from 'components/forms/segments/AccountSections/TaxesFees/useTaxFeeSection'
import AccountPageLayout from 'components/layouts/AccountPageLayout'
import { SsrAuthProviderHOC } from 'components/logic/SsrAuthContext'
import { prefetchUserQuery } from 'frontend/hooks/useUser'
import { amplifyGetServerSideProps } from 'frontend/utils/amplifyServer'
import { convertYearToNumber } from 'frontend/utils/general'
import { slovakServerSideTranslations } from 'frontend/utils/slovakServerSideTranslations'
import { ResponseTaxSummaryDetailDto } from 'openapi-clients/tax'

type AccountTaxesFeesPageProps = {
  taxData: ResponseTaxSummaryDetailDto
  strapiTaxAdministrator: StrapiTaxAdministrator | null
  dehydratedState: DehydratedState
}

type Params = {
  year: string
}

export const getServerSideProps = amplifyGetServerSideProps<AccountTaxesFeesPageProps, Params>(
  async ({ amplifyContextSpec, context, fetchAuthSession }) => {
    const year = context.params?.year
    const yearNumber = convertYearToNumber(year)
    if (!yearNumber) {
      return { notFound: true }
    }

    const queryClient = new QueryClient()

    try {
      const [{ data: taxData }, strapiTaxAdministrator] = await Promise.all([
        taxClient.taxControllerV2GetTaxDetailByYearV2(yearNumber, {
          authStrategy: 'authOnly',
          getSsrAuthSession: fetchAuthSession,
        }),
        getTaxAdministratorForUser(amplifyContextSpec),
        prefetchUserQuery(queryClient, fetchAuthSession),
      ])

      return {
        props: {
          taxData,
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
  dehydratedState,
  strapiTaxAdministrator,
}: AccountTaxesFeesPageProps) => {
  return (
    <HydrationBoundary state={dehydratedState}>
      <AccountPageLayout>
        <TaxFeeSectionProvider taxData={taxData} strapiTaxAdministrator={strapiTaxAdministrator}>
          <TaxFeePaymentSection />
        </TaxFeeSectionProvider>
      </AccountPageLayout>
    </HydrationBoundary>
  )
}

export default SsrAuthProviderHOC(AccountTaxesFeesPage)
