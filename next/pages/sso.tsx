import AccountMarkdown from 'components/forms/segments/AccountMarkdown/AccountMarkdown'
import { useTranslation } from 'next-i18next'
import { useEffectOnce } from 'usehooks-ts'

import { amplifyGetServerSideProps } from '../frontend/utils/amplifyServer'
import {
  postMessageToApprovedDomains,
  PostMessageTypes,
} from '../frontend/utils/queryParamRedirect'
import { slovakServerSideTranslations } from '../frontend/utils/slovakServerSideTranslations'

type SSOPageProps = {
  accessToken: string | null
}

export const getServerSideProps = amplifyGetServerSideProps<SSOPageProps>(
  async ({ fetchAuthSession }) => {
    const authSession = await fetchAuthSession()
    const accessToken = authSession.tokens?.accessToken.toString() ?? null

    return {
      props: {
        ...(await slovakServerSideTranslations()),
        accessToken,
      },
    }
  },
)

const SSOPage = ({ accessToken }: SSOPageProps) => {
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

export default SSOPage
