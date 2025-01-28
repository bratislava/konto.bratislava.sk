import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useRef } from 'react'
import { useEffectOnce } from 'usehooks-ts'

import { STEP_QUERY_PARAM_KEY } from '../../components/forms/useFormCurrentStepIndex'
import { ROUTES } from '../../frontend/api/constants'
import { FORM_SEND_EID_TOKEN_QUERY_KEY, popSendEidMetadata } from '../../frontend/utils/formSend'
import { STEP_QUERY_PARAM_VALUE_SUMMARY } from '../../frontend/utils/formState'

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
    const query = {
      [STEP_QUERY_PARAM_KEY]: STEP_QUERY_PARAM_VALUE_SUMMARY,
      ...(typeof token === 'string' ? { [FORM_SEND_EID_TOKEN_QUERY_KEY]: token } : {}),
    }

    const url = ROUTES.MUNICIPAL_SERVICES_FORM_WITH_ID(metadata.formSlug, metadata.formId)
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
