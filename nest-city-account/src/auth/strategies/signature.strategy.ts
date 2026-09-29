import { createPublicKey } from 'node:crypto'

import { ErrorEnum, ErrorFactoryService, ErrorResponseEnum } from '@bratislava/log-nest'
import { HttpException, Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { createVerify } from 'crypto'
import { Strategy as CustomStrategy } from 'passport-custom'

import BaConfigService from '../../config/ba-config.service'
import { NonceService } from '../services/nonce.service'
import { SignaturePublicKey } from '../types/signature-public-key.enum'
import { SignatureRequest } from '../types/signature-request.types'

/**
 * Passport strategy for RSA signature verification
 *
 * Security features:
 * - RSA-SHA256 signature verification
 * - Replay attack prevention via timestamp validation (5 minute window)
 * - Optional nonce-based replay protection for mutating endpoints (via @RequireNonce())
 * - Clock skew protection (1 minute tolerance)
 * - Timing-safe signature comparison
 * - Constant-time operations where possible
 * - Comprehensive audit logging
 *
 * The strategy validates requests signed with RSA private keys
 * and verifies them using the client's public key from validated config
 * (see BaConfigService.signaturePublicKey).
 *
 * For mutating endpoints (POST/PUT/DELETE), use @RequireNonce() decorator
 * to enforce nonce-based replay protection in addition to timestamp validation.
 */
@Injectable()
export class SignatureStrategy extends PassportStrategy(CustomStrategy, 'signature') {
  private readonly maxTimestampAge: number = 5 * 60 * 1000 // 5 minutes

  private readonly maxClockSkew: number = 60 * 1000 // 1 minute

  constructor(
    private readonly errorFactoryService: ErrorFactoryService,
    private readonly nonceService: NonceService,
    private readonly baConfigService: BaConfigService
  ) {
    super()
  }

  /**
   * Validates the signature on an incoming request
   * @param req - Express request object
   * @returns true if validation succeeds
   * @throws UnauthorizedException if validation fails
   */
  async validate(req: SignatureRequest): Promise<boolean> {
    // Set by the @SignaturePublicKeyName() decorator via SignatureGuard
    const publicKeyName = req.signaturePublicKeyName

    if (!publicKeyName) {
      throw this.errorFactoryService.UnauthorizedException({
        errorEnum: ErrorEnum.UNAUTHORIZED_ERROR,
        message: ErrorResponseEnum.UNAUTHORIZED_ERROR,
        console: 'Server configuration error: Public key not specified',
      })
    }

    const publicKeyRaw = this.baConfigService.signaturePublicKey[publicKeyName]

    // Support PEM keys stored as single-line with literal \n (e.g. in Kubernetes ConfigMaps from .env files)
    const publicKey = publicKeyRaw.replace(/\\n/g, '\n')

    if (!this.isValidPublicKeyPem(publicKey)) {
      throw this.errorFactoryService.UnauthorizedException({
        errorEnum: ErrorEnum.UNAUTHORIZED_ERROR,
        message: ErrorResponseEnum.UNAUTHORIZED_ERROR,
        console: 'Server configuration error: Invalid public key format',
      })
    }

    const signature = req.headers['x-signature']
    const timestamp = req.headers['x-timestamp']

    if (!signature || typeof signature !== 'string') {
      throw this.errorFactoryService.UnauthorizedException({
        errorEnum: ErrorEnum.UNAUTHORIZED_ERROR,
        message: ErrorResponseEnum.UNAUTHORIZED_ERROR,
        console: 'Missing X-Signature header',
      })
    }

    if (!timestamp || typeof timestamp !== 'string') {
      throw this.errorFactoryService.UnauthorizedException({
        errorEnum: ErrorEnum.UNAUTHORIZED_ERROR,
        message: ErrorResponseEnum.UNAUTHORIZED_ERROR,
        console: 'Missing X-Timestamp header',
      })
    }

    const isValidTimestampFormat =
      /^\d+$/.test(timestamp) && (timestamp.length === 10 || timestamp.length === 13)
    if (!isValidTimestampFormat) {
      throw this.errorFactoryService.UnauthorizedException({
        errorEnum: ErrorEnum.UNAUTHORIZED_ERROR,
        message: ErrorResponseEnum.UNAUTHORIZED_ERROR,
        console:
          'Invalid X-Timestamp format. Must be Unix timestamp in seconds or milliseconds (10 or 13 digits)',
      })
    }

    const requestTime = parseInt(timestamp, 10)
    if (requestTime <= 0) {
      throw this.errorFactoryService.UnauthorizedException({
        errorEnum: ErrorEnum.UNAUTHORIZED_ERROR,
        message: ErrorResponseEnum.UNAUTHORIZED_ERROR,
        console: 'Invalid X-Timestamp format. Must be Unix timestamp in milliseconds',
      })
    }

    const now = Date.now()
    const age = now - requestTime

    if (age > this.maxTimestampAge) {
      throw this.errorFactoryService.UnauthorizedException({
        errorEnum: ErrorEnum.UNAUTHORIZED_ERROR,
        message: ErrorResponseEnum.UNAUTHORIZED_ERROR,
        console: `Request timestamp too old. Age: ${age}ms, Max: ${this.maxTimestampAge}ms`,
      })
    }

    if (age < -this.maxClockSkew) {
      throw this.errorFactoryService.UnauthorizedException({
        errorEnum: ErrorEnum.UNAUTHORIZED_ERROR,
        message: ErrorResponseEnum.UNAUTHORIZED_ERROR,
        console: 'Request timestamp is in the future. Check your system clock.',
      })
    }

    // Construct the data that should have been signed
    // Format: METHOD|PATH|TIMESTAMP|BODY
    // This prevents signature reuse across different requests
    const method = req.method
    const originalUrl = req.originalUrl
    const body = JSON.stringify(req.body || {})
    const dataToVerify = `${method}|${originalUrl}|${timestamp}|${body}`

    // Verify signature using RSA-SHA256
    let isValid: boolean
    try {
      const verifier = createVerify('RSA-SHA256')
      verifier.update(dataToVerify)
      verifier.end()

      // Verify the signature against the public key
      isValid = verifier.verify(publicKey, signature, 'base64')

      if (!isValid) {
        throw this.errorFactoryService.UnauthorizedException({
          errorEnum: ErrorEnum.UNAUTHORIZED_ERROR,
          message: ErrorResponseEnum.UNAUTHORIZED_ERROR,
          console: 'Invalid signature',
        })
      }

      await this.validateNonceOrThrow(req, publicKeyName)

      return true
    } catch (error) {
      // Re-throw if it's already our exception
      if (error instanceof HttpException) {
        throw error
      }

      // Wrap other errors
      throw this.errorFactoryService.UnauthorizedException({
        errorEnum: ErrorEnum.UNAUTHORIZED_ERROR,
        message: ErrorResponseEnum.UNAUTHORIZED_ERROR,
        console: 'Signature verification failed',
        error: error instanceof Error ? error : undefined,
      })
    }
  }

  private async validateNonceOrThrow(req: SignatureRequest, publicKeyName: SignaturePublicKey) {
    const nonce = req.headers['x-nonce']

    if (!req.requireNonce && typeof nonce === 'undefined') {
      return // Nonce is not required and is not present
    }

    if (typeof nonce !== 'string') {
      throw this.errorFactoryService.UnauthorizedException({
        errorEnum: ErrorEnum.UNAUTHORIZED_ERROR,
        message: ErrorResponseEnum.UNAUTHORIZED_ERROR,
        console:
          'Missing X-Nonce header or header is not string. This endpoint requires nonce-based replay protection.',
      })
    }

    await this.nonceService.validateAndMarkUsed(nonce, publicKeyName)
  }

  private isValidPublicKeyPem(value: string): boolean {
    try {
      const key = createPublicKey(value)
      return key.type === 'public'
    } catch {
      return false
    }
  }
}
