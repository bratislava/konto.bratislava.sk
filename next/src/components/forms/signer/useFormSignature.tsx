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
import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
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
 * Result of verifying the signature with Slovensko.sk (via forms backend), see `SignatureVerificationService` in
 * nest-forms-backend.
 * - `none`: there is no signature to verify.
 * - `pending`: the verification is running (the first one for a certificate can take ~20 s).
 * - `accepted`: the signature can be sent.
 * - `unverified`: the verification could not run (e.g. Slovensko.sk unavailable), the backend verifies it again when
 *   the form is sent.
 * - `rejected`: the signature will not be accepted, the user has to sign again.
 */
export type SignatureVerification =
  | { status: 'none' | 'pending' | 'accepted' | 'unverified' }
  | { status: 'rejected'; reason: SignatureRejectionReason }

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
  const signatureVerificationQueryKey = getSignatureVerificationQueryKey(formId, signatureBase64)
  const signatureVerificationQuery = useQuery({
    queryKey: ['formSignatureVerification', formId, signatureBase64],
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

  const signatureVerification = useMemo((): SignatureVerification => {
    if (!isSigned || !signature) {
      return { status: 'none' }
    }
    if (signatureVerificationQuery.isPending) {
      return { status: 'pending' }
    }
    if (signatureVerificationQuery.isError) {
      return { status: 'unverified' }
    }
    const { accepted, verified, reason } = signatureVerificationQuery.data
    if (!accepted) {
      return { status: 'rejected', reason: reason ?? SignatureRejectionReason.Unexpected }
    }

    return { status: verified ? 'accepted' : 'unverified' }
  }, [
    isSigned,
    signature,
    signatureVerificationQuery.isPending,
    signatureVerificationQuery.isError,
    signatureVerificationQuery.data,
  ])

  /** Used when the backend rejects the signature while sending, so the summary shows why. */
  const setSignatureRejected = (reason: SignatureRejectionReason) => {
    queryClient.setQueryData<VerifyFormSignatureResponseDto>(signatureVerificationQueryKey, {
      accepted: false,
      verified: true,
      reason,
    })
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

  // This is an expensive calculation, therefore it's exposed as useCallback (not useMemo), therefore it's called only
  // when needed. useMemo would be recalculated on each formData change as this provider is global for the page.
  /** Whether the signature was created for the current form data and form definition version. */
  const isSignatureUpToDate = useCallback(() => {
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

  /**
   * Whether the form can be sent with the current signature: it is up to date and not rejected by the verification.
   * While the verification is running the form cannot be sent yet. If it could not run, sending is allowed, the
   * backend verifies the signature again.
   */
  const isValidSignature = useCallback(
    () =>
      isSignatureUpToDate() &&
      signatureVerification.status !== 'pending' &&
      signatureVerification.status !== 'rejected',
    [isSignatureUpToDate, signatureVerification.status],
  )

  return {
    signature,
    sign,
    remove,
    isValidSignature,
    isSignatureUpToDate,
    signatureVerification,
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
