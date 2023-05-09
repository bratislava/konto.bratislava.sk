import AccountMarkdown from 'components/forms/segments/AccountMarkdown/AccountMarkdown'
import { isProductionDeployment } from 'frontend/utils/general'
import { GetServerSidePropsContext } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useEffectOnce } from 'usehooks-ts'

import useAccount from '../frontend/hooks/useAccount'

const SSOPage = () => {
  const { postAccessToken } = useAccount()
  const { t } = useTranslation('account')
  useEffectOnce(() => {
    postAccessToken()
  })

  return <AccountMarkdown content={t('sso_placeholder')} />
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  if (isProductionDeployment()) return { notFound: true }

  const locale = ctx.locale ?? 'sk'

  return {
    props: {
      page: {
        locale: ctx.locale,
      },
      ...(await serverSideTranslations(locale)),
    },
  }
}

export default SSOPage
