import {
  getTaxAdministratorForUser,
  StrapiTaxAdministrator,
} from '@backend/utils/tax-administrator'
import { ResponseGetTaxesDto } from '@clients/openapi-tax'
import { taxApi } from '@clients/tax'
import { isAxiosError } from 'axios'
import TaxesFeesSection from 'components/forms/segments/AccountSections/TaxesFeesSection/TaxesFeesSection'
import AccountPageLayout from 'components/layouts/AccountPageLayout'

import { SsrAuthProviderHOC } from '../../components/logic/SsrAuthContext'
import { amplifyGetServerSideProps } from '../../frontend/utils/amplifyServer'
import { slovakServerSideTranslations } from '../../frontend/utils/slovakServerSideTranslations'

type AccountTaxesFeesPageProps = {
  taxesData: ResponseGetTaxesDto
  taxAdministrator: StrapiTaxAdministrator | null
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
    try {
      const [taxesData, taxAdministrator] = await Promise.all([
        getTaxes(getAccessToken),
        getTaxAdministratorForUser(amplifyContextSpec),
      ])

      return {
        props: {
          taxesData,
          taxAdministrator: taxAdministrator ?? null,
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

const AccountTaxesFeesPage = ({ taxesData, taxAdministrator }: AccountTaxesFeesPageProps) => {
  return (
    <AccountPageLayout>
      <TaxesFeesSection taxAdministrator={taxAdministrator} taxesData={taxesData} />
    </AccountPageLayout>
  )
}

export default SsrAuthProviderHOC(AccountTaxesFeesPage)
