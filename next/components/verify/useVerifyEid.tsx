import { cityAccountClient } from '@clients/city-account'
import { useMutation } from '@tanstack/react-query'
import { useSsrAuth } from 'frontend/hooks/useSsrAuth'
import {
  FORM_SEND_EID_TOKEN_QUERY_KEY,
  popSendEidMetadataVerify,
  setVerifyEidMetadata,
} from 'frontend/utils/metadataStorage'
import { useRouter } from 'next/router'
import React, { createContext, PropsWithChildren, useContext, useRef } from 'react'
import { useEffectOnce } from 'usehooks-ts'

import { environment } from '../../environment'
import { useRefreshServerSideProps } from '../../frontend/hooks/useRefreshServerSideProps'
import { useVerifyModals } from './useVerifyModals'

/**
 * Heavily inspired by `useFormSend` hook.
 * This hook controls veryfing identity with eID. The logic is scattered across the app.
 *
 * Verify with eID:
 * 1. The user clicks on the "Overiť s eID" button.
 * 3. Confirmation modal is shown.
 * 4. `loginWithEid` is called. This triggers redirects to the eID login page. Before redirecting, we store the
 *    metadata (that login was triggered as attempt to verify identity) in the sessionStorage to be able to restore it after the user comes back.
 *
 *  5. If user successfully logs in, he/she is redirected to /nases/login with the token in the URL. As it is not possible to parametrize the
 *   redirect URL, the login page retrieves the metadata from the sessionStorage and redirects back to the verification page URL. The URL contains the token,
 *   which, if it's detected is immediately removed from the URL and the user identity is verified using `verifyWithEid`.
 */

const useGetContext = () => {
  const router = useRouter()

  const {
    setEidVerifyingModal,
    setEidSendErrorModal,
    setRedirectingToSlovenskoSkLogin,
    setVerifyingConfirmationEidLegalModal,
  } = useVerifyModals()

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
      setEidVerifyingModal(false)
      refreshData()
    },
    onError: () => {
      setEidVerifyingModal(false)
      setEidSendErrorModal(true)
    },
    networkMode: 'always',
  })

  /**
   * As we don't want users to trigger the send again by reload we immediately remove the token from the URL.
   */
  const removeSendIdTokenFromUrl = () => {
    const url = new URL(window.location.href)
    const params = new URLSearchParams(url.search)
    params.delete(FORM_SEND_EID_TOKEN_QUERY_KEY)
    url.search = params.toString()
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    router.replace(url.toString(), undefined, { shallow: true })
  }

  // https://stackoverflow.com/a/74609594
  const effectOnceRan = useRef(false)
  useEffectOnce(() => {
    if (effectOnceRan.current) {
      return
    }
    effectOnceRan.current = true
    popSendEidMetadataVerify()

    // If there is a send token in the URL, send the form via eID.
    if (router.query[FORM_SEND_EID_TOKEN_QUERY_KEY] && !verifyWithEidIsPending) {
      sendEidTokenRef.current = router.query[FORM_SEND_EID_TOKEN_QUERY_KEY] as string

      removeSendIdTokenFromUrl()

      // this needs to happen after coming back from slovensko.sk to show user that verification is in progress
      setEidVerifyingModal(true)
      verifyWithEid()
    }
  })

  const loginWithEid = () => {
    setVerifyEidMetadata({ verifiedProcess: true })
    // We are redirecting to a trusted URL
    // eslint-disable-next-line xss/no-location-href-assign
    window.location.href = environment.slovenskoSkLoginUrl
    setRedirectingToSlovenskoSkLogin(true)
  }

  const openVerifyingConfirmationEidLegalModal = () => {
    setVerifyingConfirmationEidLegalModal({
      isOpen: true,
      confirmCallback: () => {
        loginWithEid()
      },
    })
  }

  return { openVerifyingConfirmationEidLegalModal }
}

const VerifyEidContext = createContext<ReturnType<typeof useGetContext> | undefined>(undefined)

export const VerifyEidProvider = ({ children }: PropsWithChildren) => {
  const context = useGetContext()

  return <VerifyEidContext.Provider value={context}>{children}</VerifyEidContext.Provider>
}

export const useVerifyEid = () => {
  const context = useContext(VerifyEidContext)
  if (!context) {
    throw new Error('useVerifyEid must be used within a VerifyEidProvider')
  }

  return context
}
