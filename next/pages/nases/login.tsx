import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useRef } from 'react'
import { useEffectOnce } from 'usehooks-ts'

import { STEP_QUERY_PARAM_KEY } from '../../components/forms/useFormCurrentStepIndex'
import { ROUTES } from '../../frontend/api/constants'
import { STEP_QUERY_PARAM_VALUE_SUMMARY } from '../../frontend/utils/formState'
import {
  NASES_TOKEN_QUERY_KEY,
  popSendEidMetadata,
  popVerifyEidMetadata,
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

    const sendEidMetadata = popSendEidMetadata()
    const verifyEidMetadata = popVerifyEidMetadata()

    if (!sendEidMetadata && !verifyEidMetadata) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      router.push(ROUTES.HOME)
      return
    }

    const { token } = router.query

    if (sendEidMetadata) {
      const query = {
        [STEP_QUERY_PARAM_KEY]: STEP_QUERY_PARAM_VALUE_SUMMARY,
        ...(typeof token === 'string' ? { [NASES_TOKEN_QUERY_KEY]: token } : {}),
      }

      const url = ROUTES.MUNICIPAL_SERVICES_FORM_WITH_ID(
        sendEidMetadata.formSlug,
        sendEidMetadata.formId,
      )
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      router.push(
        {
          pathname: url,
          query,
        },
        url,
      )
    }

    if (verifyEidMetadata) {
      const query = {
        ...(typeof token === 'string' ? { [NASES_TOKEN_QUERY_KEY]: token } : {}),
      }

      router.push(
        {
          pathname: ROUTES.IDENTITY_VERIFICATION,
          query,
        },
        ROUTES.IDENTITY_VERIFICATION,
      )
    }
  })

  return null
}

export default NasesLoginPage
