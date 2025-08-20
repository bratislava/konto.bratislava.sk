import {
  getTaxAdministratorForUser,
  StrapiTaxAdministrator,
} from '@backend/utils/strapi-tax-administrator'
import { strapiClient } from '@clients/graphql-strapi'
import { TaxFragment } from '@clients/graphql-strapi/api'
import { taxClient } from '@clients/tax'
import { dehydrate, DehydratedState, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import AccountPageLayout from 'components/layouts/AccountPageLayout'
import { ResponseTaxDto, ResponseTaxSummaryDetailDto } from 'openapi-clients/tax'

import TaxFeeSection from '../../components/forms/segments/AccountSections/TaxesFeesSection/TaxFeeSection'
import { StrapiTaxProvider } from '../../components/forms/segments/AccountSections/TaxesFeesSection/useStrapiTax'
import { TaxFeeSectionProvider } from '../../components/forms/segments/AccountSections/TaxesFeesSection/useTaxFeeSection'
import { SsrAuthProviderHOC } from '../../components/logic/SsrAuthContext'
import { prefetchUserQuery } from '../../frontend/hooks/useUser'
import { amplifyGetServerSideProps } from '../../frontend/utils/amplifyServer'
import { slovakServerSideTranslations } from '../../frontend/utils/slovakServerSideTranslations'

type AccountTaxesFeesPageProps = {
  taxData: ResponseTaxSummaryDetailDto
  taxDataOld: ResponseTaxDto
  strapiTaxAdministrator: StrapiTaxAdministrator | null
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
  async ({ amplifyContextSpec, context, fetchAuthSession }) => {
    const year = context.params?.year
    const yearNumber = convertYearToNumber(year)
    if (!yearNumber) {
      return { notFound: true }
    }

    const queryClient = new QueryClient()

    try {
      const [{ data: taxDataOld }, { data: taxData }, strapiTax, strapiTaxAdministrator] =
        await Promise.all([
          // TODO: implement when fixed types
          taxClient.taxControllerGetActualTaxes(yearNumber, {
            authStrategy: 'authOnly',
            getSsrAuthSession: fetchAuthSession,
          }),
          taxClient.taxControllerV2GetTaxDetailByYearV2(yearNumber, {
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
          taxDataOld,
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
  taxDataOld,
  taxData,
  strapiTax,
  dehydratedState,
  strapiTaxAdministrator,
}: AccountTaxesFeesPageProps) => {
  return (
    <HydrationBoundary state={dehydratedState}>
      <AccountPageLayout>
        <StrapiTaxProvider strapiTax={strapiTax}>
          <TaxFeeSectionProvider
            taxDataOld={taxDataOld}
            taxData={taxData}
            strapiTaxAdministrator={strapiTaxAdministrator}
          >
            <TaxFeeSection />
          </TaxFeeSectionProvider>
        </StrapiTaxProvider>
      </AccountPageLayout>
    </HydrationBoundary>
  )
}

export default SsrAuthProviderHOC(AccountTaxesFeesPage)
