export enum SignerErrorsEnum {
  XML_VALIDATION_ERROR = 'XML_VALIDATION_ERROR',
  SIGNATURE_UNTRUSTED_CERTIFICATE = 'SIGNATURE_UNTRUSTED_CERTIFICATE',
  SIGNATURE_CERTIFICATE_EXPIRED = 'SIGNATURE_CERTIFICATE_EXPIRED',
  SIGNATURE_CERTIFICATE_REVOKED = 'SIGNATURE_CERTIFICATE_REVOKED',
  SIGNATURE_INVALID = 'SIGNATURE_INVALID',
  SIGNATURE_VERIFICATION_FAILED = 'SIGNATURE_VERIFICATION_FAILED',
  SIGNATURE_VERIFICATION_UNAVAILABLE = 'SIGNATURE_VERIFICATION_UNAVAILABLE',
}

export enum SignerErrorsResponseEnum {
  XML_VALIDATION_ERROR = 'Failed to validate XML against XSD schema.',
  SIGNATURE_UNTRUSTED_CERTIFICATE = 'The form is signed with a certificate that is not a qualified signing certificate.',
  SIGNATURE_CERTIFICATE_EXPIRED = 'The signing certificate has expired.',
  SIGNATURE_CERTIFICATE_REVOKED = 'The signing certificate has been revoked.',
  SIGNATURE_INVALID = 'The signature does not match the signed document.',
  SIGNATURE_VERIFICATION_FAILED = 'The signature could not be verified.',
  SIGNATURE_VERIFICATION_UNAVAILABLE = 'Signature verification is currently unavailable.',
}
