import { GenericObjectType } from '@rjsf/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import {
  createFormSignature,
  FormSignature,
  verifyFormSignature,
} from 'forms-shared/signer/signature'
import isEqual from 'lodash/isEqual'
import { useTranslation } from 'next-i18next/pages'
import {
  SignatureRejectionReason,
  SignerDataResponseDto,
  VerifyFormSignatureResponseDto,
} from 'openapi-clients/forms'
import React, { createContext, PropsWithChildren, useCallback, useContext, useState } from 'react'
import { useIsMounted } from 'usehooks-ts'

import { formsClient } from '@/src/clients/forms'
import { isClientSlovenskoSkFormDefinition } from '@/src/components/forms/clientFormDefinitions'
import { SignerErrorType } from '@/src/components/forms/signer/mapDitecError'
import { SignerDeploymentStatus, useFormSigner } from '@/src/components/forms/signer/useFormSigner'
import { useFormContext } from '@/src/components/forms/useFormContext'
import { useFormData } from '@/src/components/forms/useFormData'
import { useFormLeaveProtection } from '@/src/components/forms/useFormLeaveProtection'
import { useFormModals } from '@/src/components/modals/FormModals/useFormModals'
import useToast from '@/src/components/simple-components/Toast/useToast'

/**
 * State of the form signature, the single source for the summary and for whether the form can be sent.
 * - `notRequired`: the form is not signed.
 * - `missing`: the form has to be signed, but is not yet.
 * - `outdated`: the signature was created for different form data or a different form version.
 * - `verifying`: the signature is being verified with Slovensko.sk (via forms backend, see
 *   `SignatureVerificationService` in nest-forms-backend). The first verification of a certificate can take ~20 s.
 * - `rejected`: the signature will not be accepted, the user has to sign again.
 * - `valid`: the signature can be sent. Also when the verification could not run (e.g. Slovensko.sk unavailable), the
 *   backend verifies the signature again when the form is sent.
 */
export type SignatureState =
  | { kind: 'notRequired' | 'missing' | 'outdated' | 'verifying' | 'valid' }
  | { kind: 'rejected'; reason: SignatureRejectionReason }

const getSignatureVerificationQueryKey = (formId: string, signatureBase64: string | undefined) => [
  'formSignatureVerification',
  formId,
  signatureBase64,
]

const useGetContext = () => {
  const { t } = useTranslation()

  const { showToast } = useToast()
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
        showToast({
          message: t('useFormSignature.errors.notInstalled'),
          variant: 'error',
        })
      } else if (error === SignerErrorType.LaunchFailed) {
        showToast({
          message: t('useFormSignature.errors.launchFailed'),
          variant: 'error',
        })
      } else {
        showToast({ message: t('useFormSignature.errors.generic'), variant: 'error' })
      }
    },
  })
  const [signature, setSignature] = useState<FormSignature | null>(initialSignature ?? null)
  const isMounted = useIsMounted()
  const queryClient = useQueryClient()

  // Runs for every signature: right after signing and for a signature restored from the server (signed earlier,
  // possibly with a wrong certificate), so the user learns about a rejection before going through the eID login.
  const signatureBase64 = signature?.signatureBase64
  const signatureVerificationQuery = useQuery({
    queryKey: getSignatureVerificationQueryKey(formId, signatureBase64),
    queryFn: async () => {
      if (!signatureBase64) {
        throw new Error('Signature verification requested without a signature.')
      }
      const response = await formsClient.signerControllerVerifyFormSignature(
        formId,
        { signatureBase64 },
        { authStrategy: 'authOrGuestWithToken' },
      )

      return response.data
    },
    enabled: isSigned && !!signatureBase64,
    // The verdict for a given signature does not change while the user is on the page.
    staleTime: Infinity,
    retry: 1,
    networkMode: 'always',
  })

  const { status: verificationStatus, data: verificationData } = signatureVerificationQuery

  /** Used when the backend rejects the signature while sending, so the summary shows why. */
  const setSignatureRejected = (reason: SignatureRejectionReason) => {
    queryClient.setQueryData<VerifyFormSignatureResponseDto>(
      getSignatureVerificationQueryKey(formId, signatureBase64),
      {
        accepted: false,
        verified: true,
        reason,
      },
    )
  }

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
      showToast({
        message: t('useFormSignature.errors.dataChanged'),
        variant: 'error',
      })
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
        formId,
        {
          formDataJson: formDataRequest,
        },
        {
          authStrategy: 'authOrGuestWithToken',
        },
      ),
    networkMode: 'always',
    onSuccess: (response, formDataRequest) => {
      // This is not awaited on purpose, because it would make the mutation pending.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      signData(formDataRequest, response.data)
    },
    onError: (error) => {
      if (isAxiosError(error) && error.response?.data?.errorName === 'BAD_REQUEST_ERROR') {
        showToast({
          message: t('useFormSignature.errors.validationError', {
            message: error.response?.data?.message,
          }),
          variant: 'error',
        })

        return
      }
      showToast({ message: t('useFormSignature.errors.generic'), variant: 'error' })
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

  // Checking the signature against the current form data is expensive, therefore this is exposed as useCallback (not
  // useMemo) and called only when needed. useMemo would be recalculated on each formData change as this provider is
  // global for the page.
  const getSignatureState = useCallback((): SignatureState => {
    if (!isSigned) {
      return { kind: 'notRequired' }
    }
    if (!signature) {
      return { kind: 'missing' }
    }
    if (!isClientSlovenskoSkFormDefinition(formDefinition)) {
      throw new Error('Unsupported form definition')
    }
    try {
      verifyFormSignature(formDefinition, formData, signature)
    } catch {
      return { kind: 'outdated' }
    }

    if (verificationStatus === 'pending') {
      return { kind: 'verifying' }
    }
    if (verificationStatus === 'error' || verificationData.accepted) {
      return { kind: 'valid' }
    }

    return {
      kind: 'rejected',
      reason: verificationData.reason ?? SignatureRejectionReason.Unexpected,
    }
  }, [isSigned, signature, formDefinition, formData, verificationStatus, verificationData])

  /** Whether the form can be sent with the current signature (or without one, if the form is not signed). */
  const isValidSignature = useCallback(() => {
    const { kind } = getSignatureState()

    return kind === 'valid' || kind === 'notRequired'
  }, [getSignatureState])

  return {
    signature,
    sign,
    remove,
    isValidSignature,
    getSignatureState,
    setSignatureRejected,
    getSingerDataIsPending,
  }
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
