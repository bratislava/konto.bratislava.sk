import { createContext, PropsWithChildren, useContext, useState } from 'react'

/**
 * Heavily inspired by `useFormModals` hook.
 */

type ModalWithConfirmCallback =
  | {
      isOpen: false
    }
  | {
      isOpen: true
      confirmCallback: (() => void) | (() => Promise<void>)
    }

const useGetContext = () => {
  const [eidVerifyingModal, setEidVerifyingModal] = useState(false)
  const [redirectingToSlovenskoSkLogin, setRedirectingToSlovenskoSkLogin] = useState(false)
  const [verifyingConfirmationEidLegalModal, setVerifyingConfirmationEidLegalModal] =
    useState<ModalWithConfirmCallback>({
      isOpen: false,
    })
  const [eidSendErrorModal, setEidSendErrorModal] = useState(false)
  const [sendEidPending, setSendEidPending] = useState(false)

  return {
    eidVerifyingModal,
    setEidVerifyingModal,
    eidSendErrorModal,
    setEidSendErrorModal,
    sendEidPending,
    setSendEidPending,
    verifyingConfirmationEidLegalModal,
    setVerifyingConfirmationEidLegalModal,
    redirectingToSlovenskoSkLogin,
    setRedirectingToSlovenskoSkLogin,
  }
}

const VerifyModalsContext = createContext<ReturnType<typeof useGetContext> | undefined>(undefined)

export const VerifyModalsProvider = ({ children }: PropsWithChildren) => {
  const context = useGetContext()

  return <VerifyModalsContext.Provider value={context}>{children}</VerifyModalsContext.Provider>
}

export const useVerifyModals = () => {
  const context = useContext(VerifyModalsContext)
  if (!context) {
    throw new Error('useVerifyModals must be used within a VerifyModalsProvider')
  }

  return context
}
