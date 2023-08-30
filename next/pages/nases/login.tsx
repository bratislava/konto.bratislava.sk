import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useRef } from 'react'
import { useEffectOnce } from 'usehooks-ts'

import { ROUTES } from '../../frontend/api/constants'
import { FORM_SEND_EID_TOKEN_QUERY_KEY, popSendEidMetadata } from '../../frontend/utils/formSend'

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} }
}

// TODO: Change URL and rename
const NasesLoginPage = () => {
  const router = useRouter()

  // https://stackoverflow.com/a/74609594
  const effectOnceRan = useRef(false)
  useEffectOnce(() => {
    if (effectOnceRan.current) {
      return
    }
    effectOnceRan.current = true
    const metadata = popSendEidMetadata()
    if (!metadata) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      router.push(ROUTES.HOME)
      return
    }

    const { token } = router.query
    const query = typeof token === 'string' ? { [FORM_SEND_EID_TOKEN_QUERY_KEY]: token } : {}

    const url = `${ROUTES.MUNICIPAL_SERVICES}/${metadata.formSlug}/${metadata.formId}`
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

export default NasesLoginPage
