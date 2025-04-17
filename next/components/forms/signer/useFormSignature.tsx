import { formsClient } from '@clients/forms'
import { GenericObjectType } from '@rjsf/utils'
import { useMutation } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import {
  createFormSignature,
  FormSignature,
  verifyFormSignature,
} from 'forms-shared/signer/signature'
import isEqual from 'lodash/isEqual'
import { SignerDataResponseDto } from 'openapi-clients/forms'
import React, { createContext, PropsWithChildren, useCallback, useContext, useState } from 'react'
import { useIsMounted } from 'usehooks-ts'

import useSnackbar from '../../../frontend/hooks/useSnackbar'
import { isClientSlovenskoSkFormDefinition } from '../clientFormDefinitions'
import { useFormContext } from '../useFormContext'
import { useFormData } from '../useFormData'
import { useFormLeaveProtection } from '../useFormLeaveProtection'
import { useFormModals } from '../useFormModals'
import { SignerErrorType } from './mapDitecError'
import { SignerDeploymentStatus, useFormSigner } from './useFormSigner'

const useGetContext = () => {
  const [openSnackbarError] = useSnackbar({ variant: 'error' })
  const { setSignerIsDeploying } = useFormModals()
  const { formDefinition, formId, isSigned, initialSignature } = useFormContext()
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

  const handleSignatureChange = (newSignature: FormSignature | null) => {
    setSignature(newSignature)
    turnOnLeaveProtection()
  }

  const signData = async (
    formDataRequest: GenericObjectType,
    signerPayload: SignerDataResponseDto,
  ) => {
    const result = await signerSign(signerPayload)
    if (!isMounted()) {
      return
    }
    // It is possible to edit the data while the signer is open.
    if (!isEqual(formDataRequest, formDataRef.current)) {
      openSnackbarError('Údaje, ktoré ste upravili, je potrebné znova podpísať.')
      handleSignatureChange(null)
      return
    }
    if (!isClientSlovenskoSkFormDefinition(formDefinition)) {
      throw new Error('Unsupported form definition')
    }

    handleSignatureChange(createFormSignature(formDefinition, result, formDataRequest))
  }

  const { mutate: getSingerDataMutate, isPending: getSingerDataIsPending } = useMutation({
    mutationFn: (formDataRequest: GenericObjectType) =>
      formsClient.signerControllerGetSignerData(
        {
          formId,
          formDataJson: formDataRequest,
        },
        {
          accessToken: 'onlyAuthenticated',
        },
      ),
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

    if (!isClientSlovenskoSkFormDefinition(formDefinition)) {
      throw new Error('Unsupported form definition')
    }

    try {
      verifyFormSignature(formDefinition, formData, signature)
      return true
    } catch (error) {
      return false
    }
  }, [isSigned, signature, formDefinition, formData])

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
