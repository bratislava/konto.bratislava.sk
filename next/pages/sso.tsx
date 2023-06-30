import AccountMarkdown from 'components/forms/segments/AccountMarkdown/AccountMarkdown'
import { getSSRAccessToken } from 'components/logic/ServerSideAuthProvider'
import { postMessageToApprovedDomains, PostMessageTypes } from 'frontend/utils/sso'
import { AsyncServerProps } from 'frontend/utils/types'
import { GetServerSidePropsContext } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useEffectOnce } from 'usehooks-ts'

const SSOPage = ({ accessToken }: AsyncServerProps<typeof getServerSideProps>) => {
  const { t } = useTranslation('account')

  useEffectOnce(() => {
    if (accessToken) {
      postMessageToApprovedDomains({
        type: PostMessageTypes.ACCESS_TOKEN,
        payload: { accessToken },
      })
    } else {
      postMessageToApprovedDomains({
        type: PostMessageTypes.UNAUTHORIZED,
      })
    }
  })

  return <AccountMarkdown content={t('sso_placeholder')} />
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const locale = ctx.locale ?? 'sk'

  return {
    props: {
      accessToken: await getSSRAccessToken(ctx.req),
      page: {
        locale: ctx.locale,
      },
      ...(await serverSideTranslations(locale)),
    },
  }
}

export default SSOPage
