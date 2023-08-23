import { useRouter } from 'next/router'
import { useRef } from 'react'
import { useEffectOnce } from 'usehooks-ts'

import { ROUTES } from '../../frontend/api/constants'
import { getSendEidMetadata, removeSendEidMetadata } from '../../frontend/utils/formSend'

export const getServerSideProps = async () => {
  return {
    props: {},
  }
}

// TODO: Change URL and rename
const NasesLoginPage = () => {
  const router = useRouter()

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
    const query = typeof token === 'string' ? { sendEidToken: token } : {}

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
