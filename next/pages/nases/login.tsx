import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useRef } from 'react'
import { useEffectOnce } from 'usehooks-ts'

import { STEP_QUERY_PARAM_KEY } from '../../components/forms/useFormCurrentStepIndex'
import { ROUTES } from '../../frontend/api/constants'
import { STEP_QUERY_PARAM_VALUE_SUMMARY } from '../../frontend/utils/formState'
import {
  FORM_SEND_EID_TOKEN_QUERY_KEY,
  popSendEidMetadata,
  popSendEidMetadataVerify,
} from '../../frontend/utils/metadataStorage'

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
    const metadataVerify = popSendEidMetadataVerify()
    if (!metadata && !metadataVerify) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      router.push(ROUTES.HOME)
      return
    }

    const { token } = router.query

    if (metadataVerify) {
      const query = {
        ...(typeof token === 'string' ? { [FORM_SEND_EID_TOKEN_QUERY_KEY]: token } : {}),
      }

      router.push(
        {
          pathname: ROUTES.IDENTITY_VERIFICATION,
          query,
        },
        ROUTES.IDENTITY_VERIFICATION,
      )
    }

    if (metadata) {
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
    }
  })

  return null
}

export default NasesLoginPage
