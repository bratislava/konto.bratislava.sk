import { useMutation } from '@tanstack/react-query'
import { useSsrAuth } from 'frontend/hooks/useSsrAuth'
import {
  NASES_TOKEN_QUERY_KEY,
  popVerifyEidMetadata,
  setVerifyEidMetadata,
} from 'frontend/utils/metadataStorage'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'

import { cityAccountClient } from '@/clients/city-account'
import { environment } from '@/environment'
import { useRefreshServerSideProps } from '@/frontend/hooks/useRefreshServerSideProps'
import { ErrorWithName } from '@/frontend/utils/errors'

export enum VerificationStatus {
  INIT = 'INIT',
  REDIRECTING = 'REDIRECTING',
  VERIFYING = 'VERIFYING',
  ERROR = 'ERROR',
}

/**
 * This hook controls verifying identity with eID.
 * Inspired by `useFormSend` hook.
 *
 * Verify with eID:
 * 1. The user clicks on the "Overiť s eID" button.
 * 2. `loginWithEid` is called. This triggers redirects to the eID login page.
 *    Before redirecting, we store the metadata (that login was triggered as attempt to verify identity) in
 *    the sessionStorage to be able to restore it after the user comes back.
 * 3. If user successfully logs in, he/she is redirected to /nases/login with the token in the URL. As it is not possible
 *    to parametrize the redirect URL, the login page retrieves the metadata from the sessionStorage and redirects
 *    back to the verification page URL. The URL contains the token, which, if it's detected is immediately removed
 *    from the URL and the user identity is verified using `verifyWithEid`.
 */

export const useVerifyEid = () => {
  const router = useRouter()

  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>(
    // When the page is opened after redirect from slovensko.sk, we show VERIFYING state and call `verifyWithEid()`
    router.query[NASES_TOKEN_QUERY_KEY] ? VerificationStatus.VERIFYING : VerificationStatus.INIT,
  )
  const [verificationError, setVerificationError] = useState<Error | null>(null)

  // As the token is immediately removed from the URL, we need to store it in a ref.
  const sendEidTokenRef = useRef<string | null>(null)
  const { tierStatus } = useSsrAuth()

  const { refreshData } = useRefreshServerSideProps(tierStatus)

  const { mutate: verifyWithEid, isPending: verifyWithEidIsPending } = useMutation({
    mutationFn: () => {
      return cityAccountClient.verificationControllerVerifyWithEid(
        {
          oboToken: sendEidTokenRef.current as string,
        },
        { authStrategy: 'authOrGuestWithToken' },
      )
    },
    onSuccess: async () => {
      refreshData()
    },
    onError: () => {
      setVerificationError(
        new ErrorWithName(
          'Unsuccessful identity verification',
          'unsuccessful-identity-verification',
        ),
      )
      setVerificationStatus(VerificationStatus.ERROR)
    },
    networkMode: 'always',
  })

  /**
   * As we don't want users to trigger the send again by reload we immediately remove the token from the URL.
   */
  const removeSendIdTokenFromUrl = () => {
    const url = new URL(window.location.href)
    const params = new URLSearchParams(url.search)
    params.delete(NASES_TOKEN_QUERY_KEY)
    url.search = params.toString()
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    router.replace(url.toString(), undefined, { shallow: true })
  }

  // https://stackoverflow.com/a/74609594
  const effectOnceRan = useRef(false)
  useEffect(() => {
    if (effectOnceRan.current) {
      return
    }
    effectOnceRan.current = true
    popVerifyEidMetadata()

    // If there is a send token in the URL, send the form via eID.
    if (router.query[NASES_TOKEN_QUERY_KEY] && !verifyWithEidIsPending) {
      sendEidTokenRef.current = router.query[NASES_TOKEN_QUERY_KEY] as string

      removeSendIdTokenFromUrl()

      verifyWithEid()
    }
    // Rewritten from useEffectOnce
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loginWithEid = () => {
    setVerificationStatus(VerificationStatus.REDIRECTING)
    setVerifyEidMetadata({ verifiedProcess: true })
    // We are redirecting to a trusted URL
    // eslint-disable-next-line xss/no-location-href-assign
    window.location.href = environment.slovenskoSkLoginUrl
  }

  return {
    loginWithEid,
    verificationStatus,
    setVerificationStatus,
    verificationError,
    setVerificationError,
  }
}
