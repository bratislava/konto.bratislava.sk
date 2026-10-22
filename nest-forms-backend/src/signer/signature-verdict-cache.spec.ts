import { createHash } from 'node:crypto'

import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Test } from '@nestjs/testing'
import {
  CepVerificationVerdict,
  SignatureRejectionReason,
} from 'forms-shared/signer/evaluateCepVerification'

import SignatureVerdictCache, {
  ACCEPTED_VERDICT_TTL_MS,
  REJECTED_VERDICT_TTL_MS,
} from './signature-verdict-cache'

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

describe('SignatureVerdictCache', () => {
  let verdictCache: SignatureVerdictCache
  let cache: { get: jest.Mock; set: jest.Mock }
  let warn: jest.Mock

  beforeEach(async () => {
    cache = { get: jest.fn(), set: jest.fn().mockResolvedValue(undefined) }
    const app = await Test.createTestingModule({
      providers: [
        SignatureVerdictCache,
        { provide: CACHE_MANAGER, useValue: cache },
      ],
    }).compile()
    verdictCache = app.get(SignatureVerdictCache)
    warn = jest.fn()
    Object.defineProperty(verdictCache, 'logger', { value: { warn } })
  })

  afterEach(() => {
    jest.useRealTimers()
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

    it('ignores a value that is not a verdict', async () => {
      cache.get.mockResolvedValue({ unexpected: true })

      await expect(verdictCache.get(SIGNATURE)).resolves.toBeUndefined()
    })

    it('treats a Redis error as a miss', async () => {
      cache.get.mockRejectedValue(new Error('connection refused'))

      await expect(verdictCache.get(SIGNATURE)).resolves.toBeUndefined()
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('connection refused'),
      )
    })

    it('gives up on a slow Redis after 1 s', async () => {
      jest.useFakeTimers()
      // A Redis call that never settles.
      const neverSettles = new Promise<never>(jest.fn())
      cache.get.mockReturnValue(neverSettles)

      const result = verdictCache.get(SIGNATURE)
      await jest.advanceTimersByTimeAsync(1000)

      await expect(result).resolves.toBeUndefined()
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('Timed out'))
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
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('connection refused'),
      )
    })
  })
})
