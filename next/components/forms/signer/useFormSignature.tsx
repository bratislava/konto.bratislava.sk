import { formsApi } from '@clients/forms'
import { TaxSignerDataResponseDto } from '@clients/openapi-forms'
import { GenericObjectType } from '@rjsf/utils'
import { useMutation } from '@tanstack/react-query'
import hash from 'object-hash'
import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { useIsClient, useIsMounted } from 'usehooks-ts'

import { useFormModals } from '../useFormModals'
import { useFormState } from '../useFormState'
// kept while it might be usefull for local testing
// import { signerExamplePayload } from './signerExamplePayload'
import { SignerDeploymentStatus, useFormSigner } from './useFormSigner'

type Signature = {
  /**
   * We store the hash of the object that was signed. This is the easiest way to ensure the validity of the signature
   * for the current data.
   */
  objectHash: string
  signature: string
}

declare global {
  interface Window {
    __DEV_SHOW_SIGNATURE?: () => void
  }
}

const useGetContext = () => {
  const { setSignerIsDeploying } = useFormModals()
  const { formData, formDataRef, isSigned } = useFormState()
  const { sign: signerSign } = useFormSigner({
    onDeploymentStatusChange: (status) => {
      setSignerIsDeploying(status === SignerDeploymentStatus.Deploying)
    },
    onError: () => {
      // TODO handle error
    },
  })
  const [signature, setSignature] = useState<Signature | null>(null)
  const isMounted = useIsMounted()

  const [showSignatureInConsole, setShowSignatureInConsole] = useState(false)
  const isClient = useIsClient()

  useEffect(() => {
    // Dev only debugging feature
    if (isClient) {
      // eslint-disable-next-line no-underscore-dangle
      window.__DEV_SHOW_SIGNATURE = () => setShowSignatureInConsole(true)
    }
  }, [isClient, setShowSignatureInConsole])

  const signData = async (
    formDataRequest: GenericObjectType,
    signerPayload: TaxSignerDataResponseDto,
  ) => {
    const result = await signerSign(signerPayload)
    if (!isMounted()) {
      return
    }
    // The easiest way how to ensure stability (1. people can leave the signer open / open it multiple times, etc. and
    // then sign the form, 2. the signer works in mysterious ways - it can spawn multiple instances) is to compare the
    // hash of the current form data with the hash of the data that was signed.
    const requestHash = hash(formDataRequest)
    const currentHash = hash(formDataRef.current)
    if (currentHash !== requestHash) {
      // TODO handle error
      setSignature(null)
      return
    }
    setSignature({ objectHash: currentHash, signature: result })
    if (showSignatureInConsole) {
      console.log('Signature:', result)
    }
  }

  const { mutate: getSingerDataMutate, isPending: getSingerDataIsPending } = useMutation({
    mutationFn: (formDataRequest: GenericObjectType) =>
      formsApi.taxControllerSignerData({ jsonForm: formDataRequest }),
    networkMode: 'always',
    onSuccess: (response, formDataRequest) => {
      // This is not awaited on purpose, because it would make the mutation pending.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      signData(formDataRequest, response.data)
    },
    onError: () => {
      // TODO error
    },
  })

  const sign = async () => {
    if (getSingerDataIsPending) {
      return
    }

    getSingerDataMutate(formData)
  }

  const remove = () => {
    setSignature(null)
  }

  // This is an expensive calculation, therefore it's exposed as useCallback (not useMemo), therefore it's called only
  // when needed. useMemo would be recalculated on each formData change as this provider is global for the page.
  const isValidSignature = useCallback(() => {
    if (!isSigned) {
      return true
    }

    if (!signature) {
      return false
    }

    return signature.objectHash === hash(formData)
  }, [isSigned, signature, formData])

  return { signature, sign, remove, isValidSignature, getSingerDataIsPending }
}

const FormSignatureContext = createContext<ReturnType<typeof useGetContext> | undefined>(undefined)

export const FormSignatureProvider = ({ children }: PropsWithChildren) => {
  const context = useGetContext()

  return <FormSignatureContext.Provider value={context}>{children}</FormSignatureContext.Provider>
}

export const useFormSignature = () => {
  const context = useContext(FormSignatureContext)
  if (!context) {
    throw new Error('useFormSignature must be used within a FormSignatureProvider')
  }

  return context
}
