import AccountMarkdown from 'components/forms/segments/AccountMarkdown/AccountMarkdown'
import { postMessageToApprovedDomains, PostMessageTypes } from 'frontend/utils/sso'
import { useTranslation } from 'next-i18next'
import { useEffectOnce } from 'usehooks-ts'

import { amplifyGetServerSideProps } from '../frontend/utils/amplifyServer'
import { isProductionDeployment } from '../frontend/utils/general'
import { slovakServerSideTranslations } from '../frontend/utils/slovakServerSideTranslations'

type SSOPageProps = {
  accessToken: string | null
}

export const getServerSideProps = amplifyGetServerSideProps<SSOPageProps>(
  async ({ getAccessToken }) => {
    if (isProductionDeployment()) return { notFound: true }

    return {
      props: {
        ...(await slovakServerSideTranslations()),
        accessToken: await getAccessToken(),
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
