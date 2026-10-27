import { ErrorFactoryService } from '@bratislava/log-nest'
import { HttpException, HttpStatus } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AxiosError, AxiosHeaders } from 'axios'

import ApiJwtTokensService from '../api-jwt-tokens/api-jwt-tokens.service'
import ClientsService from '../clients/clients.service'
import BaConfigService from '../config/ba-config.service'
import { SignatureVerificationMode } from '../config/environment-variables'
import { SignatureRejectionReason } from './evaluate-cep-verification'
import SignatureVerdictCacheService from './signature-verdict-cache.service'
import SignatureVerificationService from './signature-verification.service'
import { SignerErrorsEnum } from './signer.errors.enum'

const SIGNATURE = 'UEsDBAoAAAgAANurNFqKIflF'
const CONTEXT = { formId: 'form-1' }
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
              serial_number: '1',
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
  let apiCepVerifyPost: jest.Mock
  let config: { signatureVerification: SignatureVerificationMode }
  let loggedMessages: string[]
  let loggedErrors: unknown[]
  let verdictCache: { get: jest.Mock; set: jest.Mock }

  beforeEach(async () => {
    apiCepVerifyPost = jest.fn()
    config = { signatureVerification: SignatureVerificationMode.Enforce }
    loggedMessages = []
    loggedErrors = []
    // Always a miss unless a test says otherwise.
    verdictCache = {
      get: jest.fn().mockResolvedValue(undefined),
      set: jest.fn().mockResolvedValue(undefined),
    }

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        SignatureVerificationService,
        ErrorFactoryService,
        {
          provide: ClientsService,
          useValue: { slovenskoSkApi: { apiCepVerifyPost } },
        },
        {
          provide: ApiJwtTokensService,
          useValue: {
            createTechnicalAccountJwtToken: jest.fn().mockReturnValue('jwt'),
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

    const collect = (message: unknown) => {
      loggedMessages.push(String(message))
    }
    Object.defineProperty(service, 'logger', {
      value: {
        log: collect,
        error: (message: unknown) => {
          loggedErrors.push(message)
          collect(message)
        },
      },
    })
    Object.defineProperty(app.get(ErrorFactoryService), 'logger', {
      value: { error: collect, log: collect, debug: collect, warn: collect },
    })
  })

  const respondWith = (data: unknown) =>
    apiCepVerifyPost.mockResolvedValue({ data })

  const getRejection = async (promise: Promise<unknown>) => {
    try {
      await promise
    } catch (error) {
      return error as HttpException
    }
    throw new Error('Expected the promise to reject')
  }

  describe('calling Slovensko.sk', () => {
    it('sends the signature without whitespace, with the technical account token and a timeout', async () => {
      respondWith(RESPONSES.valid)

      await service.verifyFormSignature(
        `${SIGNATURE.slice(0, 10)}\n${SIGNATURE.slice(10)} `,
        CONTEXT,
      )

      expect(apiCepVerifyPost).toHaveBeenCalledWith(
        { content: SIGNATURE },
        expect.objectContaining({
          headers: { Authorization: 'Bearer jwt' },
          timeout: 60_000,
        }),
      )
    })

    it('logs the verdict but never the signature or the response content', async () => {
      respondWith(RESPONSES.valid)
      await service.verifyFormSignature(SIGNATURE, CONTEXT)
      apiCepVerifyPost.mockRejectedValue(upstreamError())
      await getRejection(service.assertSignatureAccepted(SIGNATURE, CONTEXT))

      const logs = loggedMessages.join('\n')
      expect(logs).toContain('form-1')
      expect(logs).toContain(ISSUER)
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

    it('verifies but accepts a rejected signature', async () => {
      respondWith(RESPONSES.untrustedCertificate)

      await expect(
        service.verifyFormSignature(SIGNATURE, CONTEXT),
      ).resolves.toEqual({
        accepted: true,
        verified: true,
      })
      await expect(
        service.assertSignatureAccepted(SIGNATURE, CONTEXT),
      ).resolves.toBeUndefined()
      expect(apiCepVerifyPost).toHaveBeenCalledTimes(2)
      expect(loggedMessages.join('\n')).toContain(
        SignatureRejectionReason.UntrustedCertificate,
      )
    })

    it('does not block sending when Slovensko.sk is unavailable', async () => {
      apiCepVerifyPost.mockRejectedValue(upstreamError())

      await expect(
        service.assertSignatureAccepted(SIGNATURE, CONTEXT),
      ).resolves.toBeUndefined()
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
      ],
      [
        'expired certificate',
        RESPONSES.expired,
        SignatureRejectionReason.CertificateExpired,
        SignerErrorsEnum.SIGNATURE_CERTIFICATE_EXPIRED,
      ],
      [
        'revoked certificate',
        RESPONSES.revoked,
        SignatureRejectionReason.CertificateRevoked,
        SignerErrorsEnum.SIGNATURE_CERTIFICATE_REVOKED,
      ],
      [
        'changed signed data',
        RESPONSES.hashFailure,
        SignatureRejectionReason.SignatureInvalid,
        SignerErrorsEnum.SIGNATURE_INVALID,
      ],
      [
        'internal error',
        RESPONSES.internalError,
        SignatureRejectionReason.Unexpected,
        SignerErrorsEnum.SIGNATURE_VERIFICATION_FAILED,
      ],
    ])('rejects %s', async (_name, response, reason, errorName) => {
      respondWith(response)

      await expect(
        service.verifyFormSignature(SIGNATURE, CONTEXT),
      ).resolves.toEqual({
        accepted: false,
        verified: true,
        reason,
      })

      const error = await getRejection(
        service.assertSignatureAccepted(SIGNATURE, CONTEXT),
      )
      expect(error.getStatus()).toBe(HttpStatus.UNPROCESSABLE_ENTITY)
      expect(error.getResponse()).toMatchObject({ errorName })
    })

    it('does not reject right after signing when Slovensko.sk is unavailable', async () => {
      apiCepVerifyPost.mockRejectedValue(upstreamError())

      await expect(
        service.verifyFormSignature(SIGNATURE, CONTEXT),
      ).resolves.toEqual({
        accepted: true,
        verified: false,
      })
    })

    it('blocks sending when Slovensko.sk is unavailable', async () => {
      apiCepVerifyPost.mockRejectedValue(upstreamError())

      const error = await getRejection(
        service.assertSignatureAccepted(SIGNATURE, CONTEXT),
      )
      expect(error.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE)
      expect(error.getResponse()).toMatchObject({
        errorName: SignerErrorsEnum.SIGNATURE_VERIFICATION_UNAVAILABLE,
      })
    })
  })

  describe('unknown responses', () => {
    const alertedErrorNames = () =>
      loggedErrors
        .filter((error) => error instanceof HttpException)
        .map(
          (error) => (error.getResponse() as { errorName: string }).errorName,
        )

    it('alerts on a response not seen while probing', async () => {
      respondWith(verified(2, 99))

      await service.verifyFormSignature(SIGNATURE, CONTEXT)

      expect(alertedErrorNames()).toEqual([
        SignerErrorsEnum.SIGNATURE_VERIFICATION_UNKNOWN_RESPONSE,
      ])
    })

    it('does not alert on a known rejection', async () => {
      respondWith(RESPONSES.untrustedCertificate)

      await service.verifyFormSignature(SIGNATURE, CONTEXT)

      expect(alertedErrorNames()).toEqual([])
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
      expect(loggedMessages.join('\n')).toContain('"cached":true')
    })

    it('stores the verdict after calling Slovensko.sk', async () => {
      respondWith(RESPONSES.valid)

      await service.assertSignatureAccepted(SIGNATURE, CONTEXT)

      expect(apiCepVerifyPost).toHaveBeenCalledTimes(1)
      expect(verdictCache.set).toHaveBeenCalledWith(
        SIGNATURE,
        expect.objectContaining({ accepted: true }),
      )
    })

    it('stores nothing when Slovensko.sk is unavailable', async () => {
      apiCepVerifyPost.mockRejectedValue(upstreamError())

      await service.verifyFormSignature(SIGNATURE, CONTEXT)

      expect(verdictCache.set).not.toHaveBeenCalled()
    })

    it(`is not used in mode ${SignatureVerificationMode.Off}`, async () => {
      config.signatureVerification = SignatureVerificationMode.Off

      await service.assertSignatureAccepted(SIGNATURE, CONTEXT)

      expect(verdictCache.get).not.toHaveBeenCalled()
    })
  })
})
