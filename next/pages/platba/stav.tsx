import ThankYouSection from 'components/forms/segments/AccountSections/ThankYouSection/ThankYouSection'
import AccountPageLayout from 'components/layouts/AccountPageLayout'
import {
  getSSRCurrentAuth,
  ServerSideAuthProviderHOC,
} from 'components/logic/ServerSideAuthProvider'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const locale = ctx.locale ?? 'sk'

  return {
    props: {
      ssrCurrentAuthProps: await getSSRCurrentAuth(ctx.req),
      ...(await serverSideTranslations(locale)),
    },
  }
}

const AccountThankYouPage = () => {
  return (
    <AccountPageLayout hiddenHeaderNav className="bg-gray-50">
      <ThankYouSection />
    </AccountPageLayout>
  )
}

export default ServerSideAuthProviderHOC(AccountThankYouPage)
