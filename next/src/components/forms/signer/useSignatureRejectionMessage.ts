import { isAxiosError } from 'axios'
import { useTranslation } from 'next-i18next/pages'
import { SignatureRejectionReason } from 'openapi-clients/forms'
import { useCallback } from 'react'

/**
 * Maps the error name returned when sending a signed form (`SignerErrorsEnum` in nest-forms-backend) to the reason
 * the signature was rejected. `undefined` for errors that are not signature rejections, including
 * `SIGNATURE_VERIFICATION_UNAVAILABLE`, which is a temporary outage and can be retried.
 */
export const getSignatureRejectionReasonFromError = (
  error: unknown,
): SignatureRejectionReason | undefined => {
  if (!isAxiosError(error)) {
    return undefined
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const errorName: unknown = error.response?.data?.errorName
  switch (errorName) {
    case 'SIGNATURE_UNTRUSTED_CERTIFICATE':
      return SignatureRejectionReason.UntrustedCertificate
    case 'SIGNATURE_CERTIFICATE_EXPIRED':
      return SignatureRejectionReason.CertificateExpired
    case 'SIGNATURE_CERTIFICATE_REVOKED':
      return SignatureRejectionReason.CertificateRevoked
    case 'SIGNATURE_INVALID':
      return SignatureRejectionReason.SignatureInvalid
    case 'SIGNATURE_VERIFICATION_FAILED':
      return SignatureRejectionReason.Unexpected
    default:
      return undefined
  }
}

/**
 * Returns a function that explains to the user why their signature was rejected. Each key is used with a static
 * `t()` call, so the translation extractor keeps them.
 */
export const useSignatureRejectionMessage = () => {
  const { t } = useTranslation()

  return useCallback(
    (reason: SignatureRejectionReason) => {
      switch (reason) {
        case SignatureRejectionReason.UntrustedCertificate:
          return t('useSignatureRejectionMessage.untrustedCertificate')
        case SignatureRejectionReason.CertificateExpired:
          return t('useSignatureRejectionMessage.certificateExpired')
        case SignatureRejectionReason.CertificateRevoked:
          return t('useSignatureRejectionMessage.certificateRevoked')
        case SignatureRejectionReason.SignatureInvalid:
          return t('useSignatureRejectionMessage.signatureInvalid')
        case SignatureRejectionReason.NotSigned:
        case SignatureRejectionReason.MultipleSignatures:
        case SignatureRejectionReason.Unexpected:
        default:
          return t('useSignatureRejectionMessage.generic')
      }
    },
    [t],
  )
}
