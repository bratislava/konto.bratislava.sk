import {
  CepVerifyResponse,
  evaluateCepVerification,
  SignatureRejectionReason,
} from './evaluate-cep-verification'

const ISSUER =
  'C=SK,L=Bratislava,2.5.4.97=NTRSK-35975946,O=Disig a.s.,CN=SVK eID ACA2'

/**
 * Responses mirror the ones returned by FIX in October 2026 (`POST /api/cep/verify`), reduced to the fields the
 * evaluation reads. Personal data (subject, signed content, mandate, verifier texts) is omitted.
 */
const authorization = (result: number, verifierResult: number) => ({
  signature: {
    certificate: { issuer: ISSUER, serial_number: '32727828142961694225201' },
  },
  verification: { result, verifier: { result: verifierResult } },
})

const verified = (
  ...authorizations: ReturnType<typeof authorization>[]
): CepVerifyResponse => ({
  verify_result: 0,
  verify_description: 'OK',
  verified_objects: [{ authorizations }],
})

const topLevel = (
  verifyResult: number,
  description: string,
): CepVerifyResponse => ({
  verify_result: verifyResult,
  verify_description: description,
})

const evaluate = evaluateCepVerification

describe('evaluateCepVerification', () => {
  describe('accepts', () => {
    test('valid signature without timestamp ("Predbežne platná", TRY_LATER)', () => {
      expect(evaluate(verified(authorization(3, 17)))).toEqual({
        accepted: true,
        signature: {
          issuer: ISSUER,
          serialNumber: '32727828142961694225201',
          result: 3,
        },
      })
    })

    test('valid signature ("Platná")', () => {
      expect(evaluate(verified(authorization(1, 0)))).toMatchObject({
        accepted: true,
      })
    })
  })

  describe('rejects', () => {
    test.each([
      [
        'wrong certificate (eID PCA/SCA, Windows, self-signed, corporate, test or non-qualified CA)',
        topLevel(
          2111217,
          'Podpisový certifikát vydaný nepodporovanou certifikačnou autoritou.',
        ),
        SignatureRejectionReason.UntrustedCertificate,
      ],
      [
        'bare XML',
        topLevel(2111042, 'Nepodporované dáta.'),
        SignatureRejectionReason.NotSigned,
      ],
      [
        'unsigned PDF',
        topLevel(2111204, 'Správa neobsahuje žiadny podpísaný dokument.'),
        SignatureRejectionReason.NotSigned,
      ],
      [
        'not a zip, ASiC without signature',
        topLevel(2111212, 'Nepodporovaný formát podpisu'),
        SignatureRejectionReason.NotSigned,
      ],
      [
        'zip that is not a signature container',
        topLevel(2111235, 'Nepodarilo sa získať podpísané dáta'),
        SignatureRejectionReason.NotSigned,
      ],
      [
        'internal error (not base64, corrupted zip)',
        topLevel(2111001, 'Interná chyba'),
        SignatureRejectionReason.Unexpected,
      ],
      [
        'unknown top-level code',
        topLevel(2999999, '?'),
        SignatureRejectionReason.Unexpected,
      ],
      [
        'OK without verified objects',
        topLevel(0, 'OK'),
        SignatureRejectionReason.NotSigned,
      ],
      [
        'OK with empty authorizations',
        { verify_result: 0, verified_objects: [{ authorizations: [] }] },
        SignatureRejectionReason.NotSigned,
      ],
    ])('%s', (_name, response, reason) => {
      expect(evaluate(response)).toEqual({
        accepted: false,
        reason,
        verifyResult: response.verify_result,
      })
    })

    test.each([
      [
        'revoked certificate',
        2,
        1,
        SignatureRejectionReason.CertificateRevoked,
      ],
      [
        'signed data changed (HASH_FAILURE)',
        2,
        2,
        SignatureRejectionReason.SignatureInvalid,
      ],
      [
        'signature value changed (SIG_CRYPTO_FAILURE)',
        2,
        3,
        SignatureRejectionReason.SignatureInvalid,
      ],
      [
        'expired certificate without timestamp (OUT_OF_BOUNDS_NO_POE)',
        6,
        20,
        SignatureRejectionReason.CertificateExpired,
      ],
      [
        'result 6 for another reason',
        6,
        99,
        SignatureRejectionReason.Unexpected,
      ],
      ['"Pravdepodobne platná"', 4, 0, SignatureRejectionReason.Unexpected],
      ['"Neoverená"', 5, 0, SignatureRejectionReason.Unexpected],
      ['unknown result', 42, 0, SignatureRejectionReason.Unexpected],
    ])('%s', (_name, result, verifierResult, reason) => {
      expect(evaluate(verified(authorization(result, verifierResult)))).toEqual(
        {
          accepted: false,
          reason,
          verifyResult: 0,
          authorizationResult: result,
          verifierResult,
        },
      )
    })

    test('authorization without verification', () => {
      expect(
        evaluate({
          verify_result: 0,
          verified_objects: [{ authorizations: [{}] }],
        }),
      ).toMatchObject({
        accepted: false,
        reason: SignatureRejectionReason.Unexpected,
      })
    })

    test.each([
      ['two valid signatures', [authorization(3, 17), authorization(3, 17)]],
      [
        'a valid and a revoked signature',
        [authorization(3, 17), authorization(2, 1)],
      ],
    ])('%s', (_name, authorizations) => {
      expect(evaluate(verified(...authorizations))).toEqual({
        accepted: false,
        reason: SignatureRejectionReason.MultipleSignatures,
        verifyResult: 0,
      })
    })

    test('two verified objects with one signature each', () => {
      expect(
        evaluate({
          verify_result: 0,
          verified_objects: [
            { authorizations: [authorization(3, 17)] },
            { authorizations: [authorization(3, 17)] },
          ],
        }),
      ).toMatchObject({
        accepted: false,
        reason: SignatureRejectionReason.MultipleSignatures,
      })
    })
  })
})
