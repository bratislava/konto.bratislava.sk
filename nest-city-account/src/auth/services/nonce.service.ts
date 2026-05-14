import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable } from '@nestjs/common'
import { Cache } from 'cache-manager'

import { ErrorsEnum, ErrorsResponseEnum } from '../../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'

/**
 * Service for managing nonce-based replay protection
 *
 * Uses Redis cache to track used nonces within a TTL window to prevent
 * replay attacks on mutating endpoints. Each nonce can only be used once
 * per client (identified by public key environment variable).
 *
 * Key format: signature-nonce:{publicKeyEnvVar}:{nonce}
 * TTL: Matches the signature timestamp validation window (5 minutes)
 */
@Injectable()
export class NonceService {
  private readonly NONCE_TTL_SECONDS = 5 * 60 // 5 minutes, matches timestamp validation

  private readonly NONCE_KEY_PREFIX = 'signature-nonce'

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly throwerErrorGuard: ThrowerErrorGuard
  ) {}

  /**
   * Validates and marks a nonce as used
   *
   * @param nonce - The nonce value from X-Nonce header
   * @param publicKeyEnvVar - The environment variable name for the client's public key
   * @throws UnauthorizedException if nonce is missing, invalid format, or already used
   * @returns true if nonce is valid and successfully marked as used
   */
  async validateAndMarkUsed(nonce: string, publicKeyEnvVar: string): Promise<boolean> {
    if (!nonce) {
      throw this.throwerErrorGuard.UnauthorizedException(
        ErrorsEnum.UNAUTHORIZED_ERROR,
        ErrorsResponseEnum.UNAUTHORIZED_ERROR,
        'Missing X-Nonce header'
      )
    }

    // Nonce must be at least 64 bits (16 hex characters) for sufficient entropy
    if (nonce.length < 16) {
      throw this.throwerErrorGuard.UnauthorizedException(
        ErrorsEnum.UNAUTHORIZED_ERROR,
        ErrorsResponseEnum.UNAUTHORIZED_ERROR,
        'Invalid X-Nonce format. Must be at least 16 characters'
      )
    }

    const key = this.buildNonceKey(publicKeyEnvVar, nonce)

    try {
      // Check if nonce already exists in cache
      const existingNonce = await this.cacheManager.get(key)

      if (existingNonce) {
        throw this.throwerErrorGuard.UnauthorizedException(
          ErrorsEnum.UNAUTHORIZED_ERROR,
          ErrorsResponseEnum.UNAUTHORIZED_ERROR,
          'Nonce has already been used. This request may be a replay attack.'
        )
      }

      // Mark nonce as used by storing it in cache with TTL
      // Value doesn't matter, we just check for key existence
      await this.cacheManager.set(key, '1', this.NONCE_TTL_SECONDS * 1000)

      return true
    } catch (error) {
      // Re-throw if it's already our exception
      if (error instanceof Error && error.name === 'UnauthorizedException') {
        throw error
      }

      // Wrap Redis/cache errors
      throw this.throwerErrorGuard.UnauthorizedException(
        ErrorsEnum.UNAUTHORIZED_ERROR,
        ErrorsResponseEnum.UNAUTHORIZED_ERROR,
        'Failed to validate nonce',
        error instanceof Error ? error : undefined
      )
    }
  }

  /**
   * Builds the Redis key for a nonce
   * Format: signature-nonce:{publicKeyEnvVar}:{nonce}
   */
  private buildNonceKey(publicKeyEnvVar: string, nonce: string): string {
    return `${this.NONCE_KEY_PREFIX}:${publicKeyEnvVar}:${nonce}`
  }
}
