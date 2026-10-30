import { createHash } from 'node:crypto'

import { ErrorFactoryService, LineLoggerService } from '@bratislava/log-nest'
import { createMock } from '@golevelup/ts-vitest'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { HttpStatus } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import type { Mock } from 'vitest'

import { expectAny, expectStringContaining } from '../__tests__/matchers'
import alertReporting from '../utils/constants/error.alerts'
import {
  CepVerificationVerdict,
  SignatureRejectionReason,
} from './evaluate-cep-verification'
import SignatureVerdictCacheService, {
  ACCEPTED_VERDICT_TTL_MS,
  REJECTED_VERDICT_TTL_MS,
} from './signature-verdict-cache.service'
import {
  SignerErrorsEnum,
  SignerErrorsResponseEnum,
} from './signer.errors.enum'

const SIGNATURE = 'UEsDBAoAAAgAANurNFqKIflF'
const KEY = `signature-verification:v1:${createHash('sha256').update(SIGNATURE).digest('hex')}`

const accepted: CepVerificationVerdict = {
  accepted: true,
  signature: { issuer: 'CN=SVK eID ACA2', serialNumber: '1', result: 3 },
}
const rejected = (
  reason: SignatureRejectionReason,
): CepVerificationVerdict => ({
  accepted: false,
  reason,
  verifyResult: 2_111_217,
})

describe('SignatureVerdictCacheService', () => {
  let verdictCache: SignatureVerdictCacheService
  let cache: { get: Mock; set: Mock }
  let logger: LineLoggerService

  beforeEach(async () => {
    cache = { get: vi.fn(), set: vi.fn().mockResolvedValue(undefined) }
    const app = await Test.createTestingModule({
      providers: [
        SignatureVerdictCacheService,
        {
          provide: ErrorFactoryService,
          useValue: new ErrorFactoryService({ alertReporting }),
        },
        {
          provide: LineLoggerService,
          useValue: createMock<LineLoggerService>(),
        },
        { provide: CACHE_MANAGER, useValue: cache },
      ],
    }).compile()
    verdictCache = app.get(SignatureVerdictCacheService)
    logger = app.get(LineLoggerService)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('get', () => {
    it('reads by a hash of the signature, never the signature itself', async () => {
      cache.get.mockResolvedValue(accepted)

      await expect(verdictCache.get(SIGNATURE)).resolves.toEqual(accepted)
      expect(cache.get).toHaveBeenCalledWith(KEY)
    })

    it('returns undefined on a miss', async () => {
      cache.get.mockResolvedValue(undefined)

      await expect(verdictCache.get(SIGNATURE)).resolves.toBeUndefined()
    })

    it('returns a cached rejection', async () => {
      const verdict = rejected(SignatureRejectionReason.UntrustedCertificate)
      cache.get.mockResolvedValue(verdict)

      await expect(verdictCache.get(SIGNATURE)).resolves.toEqual(verdict)
    })

    it('accepts an accepted verdict without issuer and serial number (dropped by JSON as undefined)', async () => {
      cache.get.mockResolvedValue({ accepted: true, signature: { result: 3 } })

      await expect(verdictCache.get(SIGNATURE)).resolves.toEqual({
        accepted: true,
        signature: { result: 3 },
      })
    })

    it.each([
      ['not a verdict', { unexpected: true }],
      ['accepted without signature', { accepted: true }],
      [
        'rejection with an unknown reason',
        { ...rejected(SignatureRejectionReason.NotSigned), reason: 'Gone' },
      ],
      [
        'rejection without verify result',
        { accepted: false, reason: SignatureRejectionReason.NotSigned },
      ],
      ['a string', 'accepted'],
    ])('ignores and alerts on %s', async (_name, value) => {
      cache.get.mockResolvedValue(value)

      await expect(verdictCache.get(SIGNATURE)).resolves.toBeUndefined()
      expect(vi.mocked(logger.error)).toHaveBeenCalledWith(
        expect.toEqualLogNestError({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          errorEnum: SignerErrorsEnum.SIGNATURE_VERDICT_CACHE_UNEXPECTED_SHAPE,
          message:
            SignerErrorsResponseEnum.SIGNATURE_VERDICT_CACHE_UNEXPECTED_SHAPE,
          console: expectAny<string>(String),
          alert: true,
        }),
      )
    })

    it('treats a Redis error as a miss', async () => {
      cache.get.mockRejectedValue(new Error('connection refused'))

      await expect(verdictCache.get(SIGNATURE)).resolves.toBeUndefined()
      expect(vi.mocked(logger.warn)).toHaveBeenCalledWith(
        expectStringContaining('connection refused'),
      )
    })

    it('gives up on a slow Redis after 1 s', async () => {
      vi.useFakeTimers()
      // A Redis call that never settles.
      const neverSettles = new Promise<never>(vi.fn())
      cache.get.mockReturnValue(neverSettles)

      const result = verdictCache.get(SIGNATURE)
      await vi.advanceTimersByTimeAsync(1000)

      await expect(result).resolves.toBeUndefined()
      expect(vi.mocked(logger.warn)).toHaveBeenCalledWith(
        expectStringContaining('Timed out'),
      )
    })
  })

  describe('set', () => {
    it('keeps an accepted verdict for an hour', async () => {
      await verdictCache.set(SIGNATURE, accepted)

      expect(cache.set).toHaveBeenCalledWith(
        KEY,
        accepted,
        ACCEPTED_VERDICT_TTL_MS,
      )
      expect(ACCEPTED_VERDICT_TTL_MS).toBe(60 * 60 * 1000)
    })

    it.each([
      SignatureRejectionReason.UntrustedCertificate,
      SignatureRejectionReason.CertificateExpired,
      SignatureRejectionReason.CertificateRevoked,
      SignatureRejectionReason.SignatureInvalid,
      SignatureRejectionReason.NotSigned,
      SignatureRejectionReason.MultipleSignatures,
    ])('keeps a %s rejection for a day', async (reason) => {
      await verdictCache.set(SIGNATURE, rejected(reason))

      expect(cache.set).toHaveBeenCalledWith(
        KEY,
        rejected(reason),
        REJECTED_VERDICT_TTL_MS,
      )
      expect(REJECTED_VERDICT_TTL_MS).toBe(24 * 60 * 60 * 1000)
    })

    it('does not cache an unexpected result', async () => {
      await verdictCache.set(
        SIGNATURE,
        rejected(SignatureRejectionReason.Unexpected),
      )

      expect(cache.set).not.toHaveBeenCalled()
    })

    it('swallows a Redis error', async () => {
      cache.set.mockRejectedValue(new Error('connection refused'))

      await expect(
        verdictCache.set(SIGNATURE, accepted),
      ).resolves.toBeUndefined()
      expect(vi.mocked(logger.warn)).toHaveBeenCalledWith(
        expectStringContaining('connection refused'),
      )
    })
  })
})
