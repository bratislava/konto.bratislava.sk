import { strapiClient } from '@clients/graphql-strapi'
import { TaxFragment } from '@clients/graphql-strapi/api'
import { ResponseTaxDto } from '@clients/openapi-tax'
import { taxApi } from '@clients/tax'
import { dehydrate, DehydratedState, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import AccountPageLayout from 'components/layouts/AccountPageLayout'

import TaxFeeSection from '../../components/forms/segments/AccountSections/TaxesFeesSection/TaxFeeSection'
import { TaxFeeSectionProvider } from '../../components/forms/segments/AccountSections/TaxesFeesSection/useTaxFeeSection'
import { SsrAuthProviderHOC } from '../../components/logic/SsrAuthContext'
import { prefetchUserQuery } from '../../frontend/hooks/useUser'
import { amplifyGetServerSideProps } from '../../frontend/utils/amplifyServer'
import { slovakServerSideTranslations } from '../../frontend/utils/slovakServerSideTranslations'

type AccountTaxesFeesPageProps = {
  taxData: ResponseTaxDto
  strapiTax: TaxFragment
  dehydratedState: DehydratedState
}

type Params = {
  year: string
}

function convertYearToNumber(input: string | undefined) {
  if (input === undefined || !/^(20\d{2})$/.test(input)) {
    return null
  }

  return parseInt(input, 10)
}

export const getServerSideProps = amplifyGetServerSideProps<AccountTaxesFeesPageProps, Params>(
  async ({ context, getAccessToken }) => {
    const year = context.params?.year
    const yearNumber = convertYearToNumber(year)
    if (!yearNumber) {
      return { notFound: true }
    }

    const queryClient = new QueryClient()

    try {
      const [{ data: taxData }, strapiTax] = await Promise.all([
        taxApi.taxControllerGetActualTaxes(yearNumber, {
          accessToken: 'always',
          accessTokenSsrGetFn: getAccessToken,
        }),
        strapiClient.Tax().then((response) => response.tax?.data?.attributes),
        prefetchUserQuery(queryClient, getAccessToken),
      ])

      if (!strapiTax) {
        return { notFound: true }
      }

      return {
        props: {
          taxData,
          strapiTax,
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
}: AccountTaxesFeesPageProps) => {
  return (
    <HydrationBoundary state={dehydratedState}>
      <AccountPageLayout>
        <TaxFeeSectionProvider taxData={taxData} strapiTax={strapiTax}>
          <TaxFeeSection />
        </TaxFeeSectionProvider>
      </AccountPageLayout>
    </HydrationBoundary>
  )
}

export default SsrAuthProviderHOC(AccountTaxesFeesPage)
