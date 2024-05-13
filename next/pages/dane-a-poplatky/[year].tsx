import type { AmplifyServer } from '@aws-amplify/core/dist/esm/adapterCore'
import { strapiClient } from '@clients/graphql-strapi'
import { TaxFragment } from '@clients/graphql-strapi/api'
import { ResponseTaxDto } from '@clients/openapi-tax'
import { taxApi } from '@clients/tax'
import { dehydrate, DehydratedState, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { fetchAuthSession, fetchUserAttributes } from 'aws-amplify/auth/server'
import { isAxiosError } from 'axios'
import AccountPageLayout from 'components/layouts/AccountPageLayout'
import { GetServerSideProps } from 'next'
import { GetServerSidePropsResult } from 'next/types'
import { v4 } from 'uuid'

import TaxFeeSection from '../../components/forms/segments/AccountSections/TaxesFeesSection/TaxFeeSection'
import { TaxFeeSectionProvider } from '../../components/forms/segments/AccountSections/TaxesFeesSection/useTaxFeeSection'
import { ssrAuthContextPropKey, SsrAuthProviderHOC } from '../../components/logic/SsrAuthContext'
import { ROUTES } from '../../frontend/api/constants'
import { prefetchUserQuery } from '../../frontend/hooks/useUser'
import { runWithAmplifyServerContext } from '../../frontend/utils/amplifyServerRunner'
import { redirectQueryParam } from '../../frontend/utils/queryParamRedirect'
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

const getAccessToken = async (amplifyContextSpec: AmplifyServer.ContextSpec) => {
  const authSession = await fetchAuthSession(amplifyContextSpec)
  return authSession.tokens?.accessToken.toString() ?? null
}

export const getServerSideProps: GetServerSideProps<AccountTaxesFeesPageProps, Params> = async (
  ctx,
) => {
  const id = v4()
  const email = await runWithAmplifyServerContext({
    nextServerContext: { request: ctx.req, response: ctx.res },
    operation: async (contextSpec: AmplifyServer.ContextSpec) => {
      try {
        const attributes = await fetchUserAttributes(contextSpec)
        return attributes.email
      } catch (error) {
        return null
      }
    },
  })

  console.log(
    `Generating server side props for ${email}, for tax year ${ctx.params?.year}, request id: ${id}`,
  )
  if (!email) {
    return {
      redirect: {
        destination: `${ROUTES.LOGIN}?${redirectQueryParam}=${encodeURIComponent(ctx.resolvedUrl)}`,
        permanent: false,
      },
    }
  }

  const props = await runWithAmplifyServerContext<
    GetServerSidePropsResult<AccountTaxesFeesPageProps>
  >({
    nextServerContext: { request: ctx.req, response: ctx.res },
    operation: async (contextSpec: AmplifyServer.ContextSpec) => {
      const year = ctx.params?.year
      const yearNumber = convertYearToNumber(year)
      if (!yearNumber) {
        return { notFound: true }
      }

      const queryClient = new QueryClient()

      try {
        const [{ data: taxData }, strapiTax, userAttributes] = await Promise.all([
          taxApi.taxControllerGetActualTaxes(yearNumber, {
            accessToken: 'always',
            accessTokenSsrGetFn: () => getAccessToken(contextSpec),
          }),
          strapiClient.Tax().then((response) => response.tax?.data?.attributes),
          fetchUserAttributes(contextSpec),
          prefetchUserQuery(queryClient, () => getAccessToken(contextSpec)),
        ])

        if (!strapiTax) {
          return { notFound: true } as const
        }

        return {
          props: {
            taxData,
            strapiTax,
            dehydratedState: dehydrate(queryClient),
            ...(await slovakServerSideTranslations()),
            [ssrAuthContextPropKey]: { isSignedIn: true, userAttributes },
          } as AccountTaxesFeesPageProps,
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
            return { notFound: true } as const
          }
        }

        throw error
      }
    },
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any,no-underscore-dangle
  const emailFromProps = (props as any)?.props?.__ssrAuthContext?.userAttributes?.email
  const emailMismatch = email && emailFromProps && email !== emailFromProps
  // eslint-disable-next-line no-console
  console.log(
    `Generated server side props for ${email}, props email ${emailFromProps}, for tax year ${ctx.params?.year}, request id: ${id}, mismatch ${emailMismatch}`,
  )
  if (emailMismatch) {
    throw new Error('Email mismatch')
  }

  return props
}

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
