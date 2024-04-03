import { ResponseTaxDto } from '@clients/openapi-tax'
import { taxApi } from '@clients/tax'
import { isAxiosError } from 'axios'
import AccountPageLayout from 'components/layouts/AccountPageLayout'

import TaxFeeSection from '../../components/forms/segments/AccountSections/TaxesFeesSection/TaxFeeSection'
import { SsrAuthProviderHOC } from '../../components/logic/SsrAuthContext'
import { amplifyGetServerSideProps } from '../../frontend/utils/amplifyServer'
import { slovakServerSideTranslations } from '../../frontend/utils/slovakServerSideTranslations'

type AccountTaxesFeesPageProps = {
  taxData: ResponseTaxDto
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

    try {
      const { data } = await taxApi.taxControllerGetActualTaxes(yearNumber, {
        accessToken: 'onlyAuthenticated',
        accessTokenSsrGetFn: getAccessToken,
      })

      return {
        props: {
          taxData: data,
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

const AccountTaxesFeesPage = ({ taxData }: AccountTaxesFeesPageProps) => {
  return (
    <AccountPageLayout>
      <TaxFeeSection taxData={taxData} />
    </AccountPageLayout>
  )
}

export default SsrAuthProviderHOC(AccountTaxesFeesPage)
