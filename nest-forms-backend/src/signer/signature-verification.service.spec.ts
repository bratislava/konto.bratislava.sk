import { ErrorFactoryService, LineLoggerService } from '@bratislava/log-nest'
import { createMock } from '@golevelup/ts-vitest'
import { HttpStatus } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AxiosError, AxiosHeaders } from 'axios'
import type { Mock } from 'vitest'

import { expectObjectContaining } from '../__tests__/matchers'
import ApiJwtTokensService from '../api-jwt-tokens/api-jwt-tokens.service'
import ClientsService from '../clients/clients.service'
import BaConfigService from '../config/ba-config.service'
import { SignatureVerificationMode } from '../config/environment-variables'
import alertReporting from '../utils/constants/error.alerts'
import { SignatureRejectionReason } from './evaluate-cep-verification'
import SignatureVerdictCacheService from './signature-verdict-cache.service'
import SignatureVerificationService from './signature-verification.service'
import {
  SignerErrorsEnum,
  SignerErrorsResponseEnum,
} from './signer.errors.enum'

const SIGNATURE = 'UEsDBAoAAAgAANurNFqKIflF'
const CONTEXT = { formId: 'form-1' }
const SERIAL_NUMBER = '1122334455667788'
const ISSUER =
  'C=SK,L=Bratislava,2.5.4.97=NTRSK-35975946,O=Disig a.s.,CN=SVK eID ACA2'

/** Mirrors the responses returned by FIX, personal data and signed content omitted. */
const verified = (result: number, verifierResult: number) => ({
  verify_result: 0,
  verify_description: 'OK',
  verified_objects: [
    {
      id: null,
      authorizations: [
        {
          signature: {
            type: 'ASiC XAdES',
            format: 'XadesBPLevelB',
            certificate: {
              issuer: ISSUER,
              serial_number: SERIAL_NUMBER,
              subject: 'CN=<redacted>',
            },
          },
          verification: { result, verifier: { result: verifierResult } },
          objects: [{ uri: 'signed_form_X.xdcf.xml', content: 'PII' }],
        },
      ],
    },
  ],
})

const RESPONSES = {
  valid: verified(3, 17),
  untrustedCertificate: {
    verify_result: 2_111_217,
    verify_description:
      'Podpisový certifikát vydaný nepodporovanou certifikačnou autoritou.',
  },
  expired: verified(6, 20),
  revoked: verified(2, 1),
  hashFailure: verified(2, 2),
  internalError: {
    verify_result: 2_111_001,
    verify_description: 'Interná chyba',
  },
}

const upstreamError = () =>
  new AxiosError(
    'Request failed with status code 502',
    'ERR_BAD_RESPONSE',
    // The request body is the signed container, it must never reach the logs.
    {
      headers: new AxiosHeaders(),
      data: JSON.stringify({ content: SIGNATURE }),
      url: '/api/cep/verify',
    },
    undefined,
    {
      status: 502,
      statusText: 'Bad Gateway',
      data: '<html>502</html>',
      headers: {},
      config: { headers: new AxiosHeaders() },
    },
  )

describe('SignatureVerificationService', () => {
  let service: SignatureVerificationService
  let apiCepVerifyPost: Mock
  let config: { signatureVerification: SignatureVerificationMode }
  let logger: LineLoggerService
  let verdictCache: { get: Mock; set: Mock }

  beforeEach(async () => {
    apiCepVerifyPost = vi.fn()
    config = { signatureVerification: SignatureVerificationMode.Enforce }
    // Always a miss unless a test says otherwise.
    verdictCache = {
      get: vi.fn().mockResolvedValue(undefined),
      set: vi.fn().mockResolvedValue(undefined),
    }

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        SignatureVerificationService,
        {
          provide: ErrorFactoryService,
          useValue: new ErrorFactoryService({ alertReporting }),
        },
        {
          provide: LineLoggerService,
          useValue: createMock<LineLoggerService>(),
        },
        {
          provide: ClientsService,
          useValue: { slovenskoSkApi: { apiCepVerifyPost } },
        },
        {
          provide: ApiJwtTokensService,
          useValue: {
            createTechnicalAccountJwtToken: vi.fn().mockReturnValue('jwt'),
          },
        },
        {
          provide: BaConfigService,
          useValue: {
            get featureToggles() {
              return config
            },
            slovenskoSk: {
              subNasesTechnicalAccount: 'sub',
              apiTokenPrivate: 'private',
            },
          },
        },
        { provide: SignatureVerdictCacheService, useValue: verdictCache },
      ],
    }).compile()

    service = app.get(SignatureVerificationService)
    logger = app.get(LineLoggerService)
  })

  /** Everything the service logged, serialized, to assert what is (not) in the logs. */
  const loggedText = () =>
    [vi.mocked(logger.log), vi.mocked(logger.error)]
      .flatMap((method) => method.mock.calls)
      .map((args) => JSON.stringify(args))
      .join('\n')

  const respondWith = (data: unknown) =>
    apiCepVerifyPost.mockResolvedValue({ data })

  describe('calling Slovensko.sk', () => {
    it('sends the signature without whitespace, with the technical account token and a timeout', async () => {
      respondWith(RESPONSES.valid)

      await service.verifyFormSignature(
        `${SIGNATURE.slice(0, 10)}\n${SIGNATURE.slice(10)} `,
        CONTEXT,
      )

      expect(apiCepVerifyPost).toHaveBeenCalledWith(
        { content: SIGNATURE },
        expectObjectContaining({
          headers: { Authorization: 'Bearer jwt' },
          timeout: 60_000,
        }),
      )
    })

    it('logs the verdict but never the signature, the certificate or the response content', async () => {
      respondWith(RESPONSES.valid)
      await service.verifyFormSignature(SIGNATURE, CONTEXT)
      apiCepVerifyPost.mockRejectedValue(upstreamError())
      await expect(
        service.assertSignatureAccepted(SIGNATURE, CONTEXT),
      ).rejects.toThrowLogNestError()

      const logs = loggedText()
      expect(logs).toContain('form-1')
      expect(logs).toContain('"result":3')
      expect(logs).not.toContain(ISSUER)
      expect(logs).not.toContain(SERIAL_NUMBER)
      expect(logs).not.toContain(SIGNATURE)
      expect(logs).not.toContain('PII')
      expect(logs).not.toContain('<redacted>')
    })
  })

  describe(`mode ${SignatureVerificationMode.Off}`, () => {
    beforeEach(() => {
      config.signatureVerification = SignatureVerificationMode.Off
    })

    it('does not call Slovensko.sk and accepts', async () => {
      await expect(
        service.verifyFormSignature(SIGNATURE, CONTEXT),
      ).resolves.toEqual({
        accepted: true,
        verified: false,
      })
      await expect(
        service.assertSignatureAccepted(SIGNATURE, CONTEXT),
      ).resolves.toBeUndefined()
      expect(apiCepVerifyPost).not.toHaveBeenCalled()
    })
  })

  describe(`mode ${SignatureVerificationMode.Log}`, () => {
    beforeEach(() => {
      config.signatureVerification = SignatureVerificationMode.Log
    })

    it('does not wait for Slovensko.sk', async () => {
      // A Slovensko.sk call that never settles.
      apiCepVerifyPost.mockReturnValue(new Promise<never>(vi.fn()))

      await expect(
        service.verifyFormSignature(SIGNATURE, CONTEXT),
      ).resolves.toEqual({
        accepted: true,
        verified: false,
      })
      await expect(
        service.assertSignatureAccepted(SIGNATURE, CONTEXT),
      ).resolves.toBeUndefined()
      await vi.waitFor(() => {
        expect(apiCepVerifyPost).toHaveBeenCalledTimes(2)
      })
    })

    it('verifies in the background and only logs a rejection', async () => {
      respondWith(RESPONSES.untrustedCertificate)

      await expect(
        service.assertSignatureAccepted(SIGNATURE, CONTEXT),
      ).resolves.toBeUndefined()
      await vi.waitFor(() => {
        expect(loggedText()).toContain(
          SignatureRejectionReason.UntrustedCertificate,
        )
      })
    })

    it('does not block sending when Slovensko.sk is unavailable', async () => {
      apiCepVerifyPost.mockRejectedValue(upstreamError())

      await expect(
        service.assertSignatureAccepted(SIGNATURE, CONTEXT),
      ).resolves.toBeUndefined()
      await vi.waitFor(() => {
        expect(loggedText()).toContain('Signature verification unavailable')
      })
    })

    it('logs an unexpected error of the background verification', async () => {
      respondWith(RESPONSES.valid)
      verdictCache.set.mockRejectedValue(new Error('unexpected'))

      await expect(
        service.assertSignatureAccepted(SIGNATURE, CONTEXT),
      ).resolves.toBeUndefined()
      await vi.waitFor(() => {
        expect(vi.mocked(logger.error)).toHaveBeenCalledWith(
          'Background signature verification failed',
          { ...CONTEXT, error: 'unexpected' },
        )
      })
    })
  })

  describe(`mode ${SignatureVerificationMode.Enforce}`, () => {
    it('accepts a valid signature', async () => {
      respondWith(RESPONSES.valid)

      await expect(
        service.verifyFormSignature(SIGNATURE, CONTEXT),
      ).resolves.toEqual({
        accepted: true,
        verified: true,
      })
      await expect(
        service.assertSignatureAccepted(SIGNATURE, CONTEXT),
      ).resolves.toBeUndefined()
    })

    it.each([
      [
        'untrusted certificate',
        RESPONSES.untrustedCertificate,
        SignatureRejectionReason.UntrustedCertificate,
        SignerErrorsEnum.SIGNATURE_UNTRUSTED_CERTIFICATE,
        SignerErrorsResponseEnum.SIGNATURE_UNTRUSTED_CERTIFICATE,
      ],
      [
        'expired certificate',
        RESPONSES.expired,
        SignatureRejectionReason.CertificateExpired,
        SignerErrorsEnum.SIGNATURE_CERTIFICATE_EXPIRED,
        SignerErrorsResponseEnum.SIGNATURE_CERTIFICATE_EXPIRED,
      ],
      [
        'revoked certificate',
        RESPONSES.revoked,
        SignatureRejectionReason.CertificateRevoked,
        SignerErrorsEnum.SIGNATURE_CERTIFICATE_REVOKED,
        SignerErrorsResponseEnum.SIGNATURE_CERTIFICATE_REVOKED,
      ],
      [
        'changed signed data',
        RESPONSES.hashFailure,
        SignatureRejectionReason.SignatureInvalid,
        SignerErrorsEnum.SIGNATURE_INVALID,
        SignerErrorsResponseEnum.SIGNATURE_INVALID,
      ],
      [
        'internal error',
        RESPONSES.internalError,
        SignatureRejectionReason.Unexpected,
        SignerErrorsEnum.SIGNATURE_VERIFICATION_FAILED,
        SignerErrorsResponseEnum.SIGNATURE_VERIFICATION_FAILED,
      ],
    ])('rejects %s', async (_name, response, reason, errorEnum, message) => {
      respondWith(response)

      await expect(
        service.verifyFormSignature(SIGNATURE, CONTEXT),
      ).resolves.toEqual({
        accepted: false,
        verified: true,
        reason,
      })

      await expect(
        service.assertSignatureAccepted(SIGNATURE, CONTEXT),
      ).rejects.toThrowEqualLogNestError({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errorEnum,
        message,
        console: {
          ...CONTEXT,
          verdict: expectObjectContaining({ accepted: false, reason }),
        },
      })
    })

    it('fails right after signing when Slovensko.sk is unavailable', async () => {
      apiCepVerifyPost.mockRejectedValue(upstreamError())

      await expect(
        service.verifyFormSignature(SIGNATURE, CONTEXT),
      ).rejects.toThrowEqualLogNestError({
        status: HttpStatus.SERVICE_UNAVAILABLE,
        errorEnum: SignerErrorsEnum.SIGNATURE_VERIFICATION_UNAVAILABLE,
        message: SignerErrorsResponseEnum.SIGNATURE_VERIFICATION_UNAVAILABLE,
        console: CONTEXT,
      })
    })

    it('blocks sending when Slovensko.sk is unavailable', async () => {
      apiCepVerifyPost.mockRejectedValue(upstreamError())

      await expect(
        service.assertSignatureAccepted(SIGNATURE, CONTEXT),
      ).rejects.toThrowEqualLogNestError({
        status: HttpStatus.SERVICE_UNAVAILABLE,
        errorEnum: SignerErrorsEnum.SIGNATURE_VERIFICATION_UNAVAILABLE,
        message: SignerErrorsResponseEnum.SIGNATURE_VERIFICATION_UNAVAILABLE,
        console: CONTEXT,
      })
    })
  })

  describe('unknown responses', () => {
    it('alerts on a response not seen while probing', async () => {
      respondWith(verified(2, 99))

      await service.verifyFormSignature(SIGNATURE, CONTEXT)

      expect(vi.mocked(logger.error)).toHaveBeenCalledWith(
        expect.toEqualLogNestError({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          errorEnum: SignerErrorsEnum.SIGNATURE_VERIFICATION_UNKNOWN_RESPONSE,
          message:
            SignerErrorsResponseEnum.SIGNATURE_VERIFICATION_UNKNOWN_RESPONSE,
          console: {
            ...CONTEXT,
            verdict: expectObjectContaining({ verifierResult: 99 }),
          },
          alert: true,
        }),
      )
    })

    it('does not alert on a known rejection', async () => {
      respondWith(RESPONSES.untrustedCertificate)

      await service.verifyFormSignature(SIGNATURE, CONTEXT)

      expect(vi.mocked(logger.error)).not.toHaveBeenCalledWith(
        expect.toBeLogNestError(),
      )
    })
  })

  describe('verdict cache', () => {
    it('uses a cached verdict without calling Slovensko.sk', async () => {
      verdictCache.get.mockResolvedValue({
        accepted: false,
        reason: SignatureRejectionReason.UntrustedCertificate,
        verifyResult: 2_111_217,
      })

      await expect(
        service.verifyFormSignature(`${SIGNATURE}\n`, CONTEXT),
      ).resolves.toEqual({
        accepted: false,
        verified: true,
        reason: SignatureRejectionReason.UntrustedCertificate,
      })
      expect(verdictCache.get).toHaveBeenCalledWith(SIGNATURE)
      expect(apiCepVerifyPost).not.toHaveBeenCalled()
      expect(loggedText()).toContain('"cached":true')
    })

    it('stores the verdict after calling Slovensko.sk', async () => {
      respondWith(RESPONSES.valid)

      await service.assertSignatureAccepted(SIGNATURE, CONTEXT)

      expect(apiCepVerifyPost).toHaveBeenCalledTimes(1)
      expect(verdictCache.set).toHaveBeenCalledWith(
        SIGNATURE,
        expectObjectContaining({ accepted: true }),
      )
    })

    it('stores nothing when Slovensko.sk is unavailable', async () => {
      apiCepVerifyPost.mockRejectedValue(upstreamError())

      await expect(
        service.verifyFormSignature(SIGNATURE, CONTEXT),
      ).rejects.toThrowLogNestError()

      expect(verdictCache.set).not.toHaveBeenCalled()
    })

    it(`is not used in mode ${SignatureVerificationMode.Off}`, async () => {
      config.signatureVerification = SignatureVerificationMode.Off

      await service.assertSignatureAccepted(SIGNATURE, CONTEXT)

      expect(verdictCache.get).not.toHaveBeenCalled()
    })
  })
})
