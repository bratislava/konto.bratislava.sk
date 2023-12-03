import { formsApi } from '@clients/forms'
import hash from 'object-hash'
import React, { createContext, PropsWithChildren, useCallback, useContext, useState } from 'react'
import { useIsMounted } from 'usehooks-ts'

import { useFormState } from '../useFormState'
// kept while it might be usefull for local testing
// import { signerExamplePayload } from './signerExamplePayload'
import { useFormSigner } from './useFormSigner'

type Signature = {
  /**
   * We store the hash of the object that was signed. This is the easiest way to ensure the validity of the signature
   * for the current data.
   */
  objectHash: string
  signature: string
}

const useGetContext = () => {
  const { formData, formDataRef, isSigned } = useFormState()
  const { sign: signerSign } = useFormSigner()
  const [signature, setSignature] = useState<Signature | null>(null)
  const isMounted = useIsMounted()

  const sign = async () => {
    try {
      const { data: signerPayload } = await formsApi.taxControllerSignerData({ jsonForm: formData })
      // console.logs on purpose
      console.log('-------------')
      console.log(signerPayload)
      const jsonObjectHash = hash(formData)
      const result = await signerSign(signerPayload)
      if (!isMounted()) {
        return
      }
      const currentHash = hash(formDataRef.current)
      // The easiest way how to ensure stability (1. people can leave the signer open / open it multiple times, etc. and
      // then sign the form, 2. the signer works in mysterious ways - it can spawn multiple instances) is to compare the
      // hash of the current form data with the hash of the data that was signed.
      if (currentHash !== jsonObjectHash) {
        // TODO handle error
        return
      }
      setSignature({ objectHash: currentHash, signature: result })
      // console.logs on purpose
      console.log('###############')
      console.log(result)
    } catch (error) {
      // TODO handle error
    }
  }

  const remove = () => {
    setSignature(null)
  }

  // This is an expensive calculation, therefore it's exposed as useCallback (not useMemo), therefore it's called only
  // when needed. useMemo would be recalculated on each render as this provider is global for the page.
  const isValidSignature = useCallback(() => {
    if (!isSigned) {
      return true
    }

    if (!signature) {
      return false
    }

    return signature.objectHash === hash(formData)
  }, [isSigned, signature, formData])

  return { signature, sign, remove, isValidSignature }
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
