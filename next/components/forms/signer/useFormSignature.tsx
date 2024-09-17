import { formsApi } from '@clients/forms'
import { TaxSignerDataResponseDto } from '@clients/openapi-forms'
import { GenericObjectType } from '@rjsf/utils'
import { useMutation } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
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

import useSnackbar from '../../../frontend/hooks/useSnackbar'
import { createFormSignatureId } from '../../../frontend/utils/formSignature'
import { useFormContext } from '../useFormContext'
import { useFormData } from '../useFormData'
import { useFormLeaveProtection } from '../useFormLeaveProtection'
import { useFormModals } from '../useFormModals'
import { SignerErrorType } from './mapDitecError'
// kept while it might be usefull for local testing
// import { signerExamplePayload } from './signerExamplePayload'
import { SignerDeploymentStatus, useFormSigner } from './useFormSigner'

export type FormSignature = {
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
  const [openSnackbarError] = useSnackbar({ variant: 'error' })
  const { setSignerIsDeploying } = useFormModals()
  const { isSigned, initialSignature } = useFormContext()
  const { formData, formDataRef } = useFormData()
  const { turnOnLeaveProtection } = useFormLeaveProtection()
  const { sign: signerSign } = useFormSigner({
    onDeploymentStatusChange: (status) => {
      setSignerIsDeploying(status === SignerDeploymentStatus.Deploying)
    },
    onError: (error) => {
      if (error === SignerErrorType.NotInstalled) {
        openSnackbarError(
          'Na podpísanie je potrebné nainštalovať podpisovaciu aplikáciu pre kvalifikovaný elektronický podpis.',
        )
      } else if (error === SignerErrorType.LaunchFailed) {
        openSnackbarError('Podpisovacia aplikácia sa nepodarila načítať, skúste to znova.')
      } else {
        openSnackbarError('Podpisovanie zlyhalo. Skúste to znova.')
      }
    },
  })
  const [signature, setSignature] = useState<FormSignature | null>(initialSignature ?? null)
  const isMounted = useIsMounted()

  const [showSignatureInConsole, setShowSignatureInConsole] = useState(false)
  const isClient = useIsClient()

  const handleSignatureChange = (newSignature: FormSignature | null) => {
    setSignature(newSignature)
    turnOnLeaveProtection()
  }

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
    const requestHash = hash(formDataRequest)
    const result = await signerSign({
      ...signerPayload,
      // The object hash is stored in the signature id, as it is retrieved later on when form is opened in `getInitialFormSignature`.
      signatureId: createFormSignatureId(requestHash),
    })
    if (!isMounted()) {
      return
    }
    // It is possible to edit the data while the signer is open. The easiest way how to ensure the validity of the
    // signature is to check the hash of the data that was signed versus the current data.
    const currentHash = hash(formDataRef.current)
    if (currentHash !== requestHash) {
      openSnackbarError('Údaje, ktoré ste upravili, je potrebné znova podpísať.')
      handleSignatureChange(null)
      return
    }
    handleSignatureChange({ objectHash: currentHash, signature: result })
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
    onError: (error) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (isAxiosError(error) && error.response?.data?.errorName === 'BAD_REQUEST_ERROR') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        openSnackbarError(`Nastala chyba pri validácii: \n\n${error.response?.data?.message}`)
        return
      }
      openSnackbarError('Podpisovanie zlyhalo. Skúste to znova.')
    },
  })

  const sign = async () => {
    if (getSingerDataIsPending) {
      return
    }

    getSingerDataMutate(formData)
  }

  const remove = () => {
    handleSignatureChange(null)
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
