import { useTranslation } from 'next-i18next/pages'
import { useEffect } from 'react'

import Markdown from '@/src/components/formatting/Markdown'
import { amplifyGetServerSideProps } from '@/src/frontend/utils/amplifyServer'
import {
  postMessageToApprovedDomains,
  PostMessageTypes,
} from '@/src/frontend/utils/queryParamRedirect'
import { slovakServerSideTranslations } from '@/src/frontend/utils/slovakServerSideTranslations'

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
  const { t } = useTranslation()

  useEffect(() => {
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
    // Rewritten from useEffectOnce
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <Markdown variant="default" content={t('SSOPage.placeholder')} />
}

export default SSOPage
