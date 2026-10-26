import { z } from 'zod'

/**
 * Interprets the response of the slovensko.sk API `POST /api/cep/verify` (informative signature verification).
 *
 * The codes below were observed on the FIX environment (October 2026) with real signed forms and crafted containers.
 * There is no public list of `verify_result` codes, unknown codes are rejected as `Unexpected`.
 *
 * The result depends on whether the signature contains a qualified timestamp, not on the signing software. Users can
 * sign with any software that plugs into the signer interface: besides D.Signer, about 1 % of production signatures
 * come from a DSS-based signer (e.g. Autogram). All signatures observed in production (2024–2026) are XAdES baseline B
 * without a timestamp:
 * - A correct one is reported as "Predbežne platná" (3), not "Platná" (1), because CEP can only check it against the
 *   current revocation data.
 * - Once the signing certificate expires, the result changes to 6, because nothing proves the signature was created
 *   while the certificate was valid. The verification is therefore only meaningful at the time the form is sent.
 *
 * A signature with a qualified timestamp (baseline T or higher) is expected to be reported as "Platná" (1) and to
 * remain valid after the certificate expires. It is accepted as well.
 */

/** `verify_result` (top level) */
export const CEP_VERIFY_RESULT_OK = 0
/** "Podpisový certifikát vydaný nepodporovanou certifikačnou autoritou." Wrong certificate (eID PCA/SCA, Windows, self-signed, corporate, test, non-qualified CA…). */
export const CEP_VERIFY_RESULT_UNTRUSTED_CA = 2111217
/** "Interná chyba". Not base64, corrupted zip, renamed data file. */
export const CEP_VERIFY_RESULT_INTERNAL_ERROR = 2111001
const CEP_VERIFY_RESULTS_NOT_SIGNED = new Set([
  2111042, // Nepodporované dáta. (bare XML)
  2111204, // Správa neobsahuje žiadny podpísaný dokument. (unsigned PDF)
  2111212, // Nepodporovaný formát podpisu (not a zip, ASiC without signature)
  2111235, // Nepodarilo sa získať podpísané dáta (zip that is not a signature container)
])

/** `verified_objects[].authorizations[].verification.result` */
export enum CepAuthorizationResult {
  Valid = 1, // Platná
  Invalid = 2, // Neplatná
  PreliminarilyValid = 3, // Predbežne platná
  ProbablyValid = 4, // Pravdepodobne platná (documented, not observed)
  NotVerified = 5, // Neoverená (documented, not observed)
  UndecidableNow = 6, // Aktuálne nie je možné rozhodnúť (not in the documented 1–5 list)
}

const ACCEPTED_AUTHORIZATION_RESULTS = new Set<number>([
  CepAuthorizationResult.Valid,
  CepAuthorizationResult.PreliminarilyValid,
])

/** `verified_objects[].authorizations[].verification.verifier.result` */
export enum CepVerifierResult {
  Revoked = 1, // INVALID - REVOKED
  HashFailure = 2, // INVALID - HASH_FAILURE (signed data changed)
  SigCryptoFailure = 3, // INVALID - SIG_CRYPTO_FAILURE (signature value changed)
  TryLater = 17, // INDETERMINATE - TRY_LATER (accompanies "Predbežne platná")
  OutOfBoundsNoPoe = 20, // INDETERMINATE - OUT_OF_BOUNDS_NO_POE (certificate expired, no timestamp)
}

/**
 * Subset of the response the evaluation relies on, as returned at runtime. Not taken from
 * `openapi-clients/slovensko-sk`: the generated `ApiCepVerifyPost200Response` types the authorizations of ASiC
 * objects without `signature` and `verification` (the `allOf` with the base object is not merged), although the API
 * returns them.
 */
export interface CepVerifyResponse {
  verify_result: number
  verify_description?: string
  verified_objects?: { authorizations?: CepAuthorization[] }[]
}

interface CepAuthorization {
  signature?: { certificate?: { issuer?: string; serial_number?: string } }
  verification?: { result?: number; verifier?: { result?: number } }
}

export enum SignatureRejectionReason {
  UntrustedCertificate = 'UntrustedCertificate',
  CertificateExpired = 'CertificateExpired',
  CertificateRevoked = 'CertificateRevoked',
  SignatureInvalid = 'SignatureInvalid',
  NotSigned = 'NotSigned',
  /** Signing in the form produces exactly one signature, more than one is never a valid submission. */
  MultipleSignatures = 'MultipleSignatures',
  Unexpected = 'Unexpected',
}

const acceptedSignatureSchema = z.object({
  /** Distinguished name of the certificate issuer, contains no personal data. */
  issuer: z.string().optional(),
  serialNumber: z.string().optional(),
  result: z.number(),
})

/**
 * The verdict intentionally contains no personal data. The raw response contains the whole signed form, the
 * signer's subject (incl. birth number) and for revoked certificates also in `verifier.description`, so it must not be
 * logged. The schema validates verdicts read back from the cache.
 */
export const cepVerificationVerdictSchema = z.discriminatedUnion('accepted', [
  z.object({
    accepted: z.literal(true),
    signature: acceptedSignatureSchema,
  }),
  z.object({
    accepted: z.literal(false),
    reason: z.enum(SignatureRejectionReason),
    verifyResult: z.number(),
    authorizationResult: z.number().optional(),
    verifierResult: z.number().optional(),
  }),
])

export type AcceptedSignature = z.infer<typeof acceptedSignatureSchema>
export type CepVerificationVerdict = z.infer<
  typeof cepVerificationVerdictSchema
>

export const evaluateCepVerification = (
  response: CepVerifyResponse,
): CepVerificationVerdict => {
  const verifyResult = response.verify_result
  const reject = (
    reason: SignatureRejectionReason,
    codes: { authorizationResult?: number; verifierResult?: number } = {},
  ): CepVerificationVerdict => ({
    accepted: false,
    reason,
    verifyResult,
    ...codes,
  })

  if (verifyResult === CEP_VERIFY_RESULT_UNTRUSTED_CA) {
    return reject(SignatureRejectionReason.UntrustedCertificate)
  }
  if (CEP_VERIFY_RESULTS_NOT_SIGNED.has(verifyResult)) {
    return reject(SignatureRejectionReason.NotSigned)
  }
  if (verifyResult !== CEP_VERIFY_RESULT_OK) {
    return reject(SignatureRejectionReason.Unexpected)
  }

  const authorizations = (response.verified_objects ?? []).flatMap(
    (verifiedObject) => verifiedObject.authorizations ?? [],
  )
  if (authorizations.length === 0) {
    return reject(SignatureRejectionReason.NotSigned)
  }
  if (authorizations.length > 1) {
    return reject(SignatureRejectionReason.MultipleSignatures)
  }

  const [authorization] = authorizations
  const authorizationResult = authorization.verification?.result
  const verifierResult = authorization.verification?.verifier?.result
  const codes = { authorizationResult, verifierResult }

  if (authorizationResult === CepAuthorizationResult.Invalid) {
    return reject(
      verifierResult === CepVerifierResult.Revoked
        ? SignatureRejectionReason.CertificateRevoked
        : SignatureRejectionReason.SignatureInvalid,
      codes,
    )
  }
  if (
    authorizationResult === CepAuthorizationResult.UndecidableNow &&
    verifierResult === CepVerifierResult.OutOfBoundsNoPoe
  ) {
    return reject(SignatureRejectionReason.CertificateExpired, codes)
  }
  if (
    authorizationResult === undefined ||
    !ACCEPTED_AUTHORIZATION_RESULTS.has(authorizationResult)
  ) {
    return reject(SignatureRejectionReason.Unexpected, codes)
  }

  return {
    accepted: true,
    signature: {
      issuer: authorization.signature?.certificate?.issuer,
      serialNumber: authorization.signature?.certificate?.serial_number,
      result: authorizationResult,
    },
  }
}
