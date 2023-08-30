import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useRef } from 'react'
import { useEffectOnce } from 'usehooks-ts'

import { getSSRCurrentAuth, ServerSideAuthProviderHOC } from '../../components/logic/ServerSideAuthProvider'
import { ROUTES } from '../../frontend/api/constants'
import { useServerSideAuth } from '../../frontend/hooks/useServerSideAuth'
import {
  FORM_SEND_EID_TOKEN_QUERY_KEY,
  FORM_SEND_FORM_ID_QUERY_KEY,
  getSendEidMetadata,
  removeSendEidMetadata,
} from '../../frontend/utils/formSend'

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const ssrCurrentAuthProps = await getSSRCurrentAuth(ctx.req)


  return {
    props: {ssrCurrentAuthProps},
  }
}

// TODO: Change URL and rename
const NasesLoginPage = () => {
  const router = useRouter()
const  { isAuthenticated } = useServerSideAuth()

  // https://stackoverflow.com/a/74609594
  const effectOnceRan = useRef(false)
  useEffectOnce(() => {
    if (effectOnceRan.current) {
      return
    }
    effectOnceRan.current = true
    const metadata = getSendEidMetadata()
    if (!metadata) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      router.push(ROUTES.HOME)
      return
    }

    removeSendEidMetadata()

    const { token } = router.query
    const query = typeof token === 'string' ? { [FORM_SEND_EID_TOKEN_QUERY_KEY]: token } : {}

    const url = isAuthenticated ? `${ROUTES.MUNICIPAL_SERVICES}/${metadata.formSlug}/${metadata.formId}` : `${ROUTES.MUNICIPAL_SERVICES}/${metadata.formSlug}?${FORM_SEND_FORM_ID_QUERY_KEY}=${metadata.formId}`
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    router.push(
      {
        pathname: url,
        query,
      },
      url,
    )
  })

  return null
}

export default ServerSideAuthProviderHOC(NasesLoginPage)
