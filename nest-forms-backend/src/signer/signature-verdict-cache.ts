import { createHash } from 'node:crypto'

import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable, Logger } from '@nestjs/common'
import type { Cache } from 'cache-manager'

import {
  CepVerificationVerdict,
  cepVerificationVerdictSchema,
  SignatureRejectionReason,
} from './evaluate-cep-verification'

const KEY_PREFIX = 'signature-verification:v1:'

/**
 * Accepted signatures can still be revoked or expire, they are re-verified after an hour. CEP itself checks against
 * revocation lists that are updated every few hours, so this adds little delay to detecting a revocation.
 */
export const ACCEPTED_VERDICT_TTL_MS = 60 * 60 * 1000
/** Rejections (wrong, expired or revoked certificate, broken signature) do not become valid again. */
export const REJECTED_VERDICT_TTL_MS = 24 * 60 * 60 * 1000
/** Possibly transient (e.g. "Interná chyba"), always asked again. */
const NOT_CACHED_REASONS = new Set([SignatureRejectionReason.Unexpected])

/** The cache must never slow down signing or sending, a slow Redis is treated as a miss. */
const OPERATION_TIMEOUT_MS = 1000

/**
 * Caches CEP verification verdicts in Redis, keyed by a hash of the signature. The verdict contains only codes and
 * the certificate issuer, no personal data. Failures are logged and treated as a miss, so a Redis outage only means
 * CEP is called every time.
 */
@Injectable()
export default class SignatureVerdictCache {
  private readonly logger = new Logger('SignatureVerdictCache')

  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  private static key(signatureBase64: string) {
    return `${KEY_PREFIX}${createHash('sha256').update(signatureBase64).digest('hex')}`
  }

  private async withTimeout<T>(operation: Promise<T>): Promise<T> {
    let timer: NodeJS.Timeout | undefined
    try {
      return await Promise.race([
        operation,
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => {
            reject(new Error(`Timed out after ${OPERATION_TIMEOUT_MS} ms`))
          }, OPERATION_TIMEOUT_MS)
        }),
      ])
    } finally {
      clearTimeout(timer)
    }
  }

  async get(
    signatureBase64: string,
  ): Promise<CepVerificationVerdict | undefined> {
    try {
      const value = await this.withTimeout(
        this.cache.get<unknown>(SignatureVerdictCache.key(signatureBase64)),
      )
      if (value === undefined) {
        return undefined
      }

      const parsed = cepVerificationVerdictSchema.safeParse(value)
      if (!parsed.success) {
        this.logger.warn(
          `Ignoring cached signature verdict with unexpected shape: ${parsed.error.message}`,
        )
        return undefined
      }
      return parsed.data
    } catch (error) {
      this.logger.warn(
        `Reading cached signature verdict failed: ${error instanceof Error ? error.message : String(error)}`,
      )
      return undefined
    }
  }

  async set(
    signatureBase64: string,
    verdict: CepVerificationVerdict,
  ): Promise<void> {
    if (!verdict.accepted && NOT_CACHED_REASONS.has(verdict.reason)) {
      return
    }

    try {
      await this.withTimeout(
        this.cache.set(
          SignatureVerdictCache.key(signatureBase64),
          verdict,
          verdict.accepted ? ACCEPTED_VERDICT_TTL_MS : REJECTED_VERDICT_TTL_MS,
        ),
      )
    } catch (error) {
      this.logger.warn(
        `Caching signature verdict failed: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }
}
