import AccountPageLayout from 'components/layouts/AccountPageLayout'
import {
  getSSRCurrentAuth,
  ServerSideAuthProviderHOC,
} from 'components/logic/ServerSideAuthProvider'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import TaxFeeSection from '../../components/forms/segments/AccountSections/TaxesFeesSection/TaxFeeSection'
import { ROUTES } from '../../frontend/api/constants'

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const locale = ctx.locale ?? 'sk'

  const ssrCurrentAuthProps = await getSSRCurrentAuth(ctx.req)
  if (!ssrCurrentAuthProps.userData) {
    return {
      // TODO: Redirect back after login
      redirect: {
        destination: ROUTES.LOGIN,
        permanent: false,
      },
    }
  }

  return {
    props: {
      ssrCurrentAuthProps,
      ...(await serverSideTranslations(locale)),
    },
  }
}

const AccountTaxesFeesPage = () => {
  return (
    <AccountPageLayout>
      <TaxFeeSection />
    </AccountPageLayout>
  )
}

export default ServerSideAuthProviderHOC(AccountTaxesFeesPage)
