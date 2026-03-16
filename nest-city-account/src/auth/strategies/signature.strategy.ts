import { HttpException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy as CustomStrategy } from 'passport-custom'
import { createVerify } from 'crypto'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { ErrorsEnum, ErrorsResponseEnum } from '../../utils/guards/dtos/error.dto'
import { SignatureRequest } from '../types/signature-request.types'
import { createPublicKey } from 'node:crypto'
import { NonceService } from '../services/nonce.service'

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
 * and verifies them using the client's public key from environment variables.
 *
 * For mutating endpoints (POST/PUT/DELETE), use @RequireNonce() decorator
 * to enforce nonce-based replay protection in addition to timestamp validation.
 */
@Injectable()
export class SignatureStrategy extends PassportStrategy(CustomStrategy, 'signature') {
  private readonly maxTimestampAge: number = 5 * 60 * 1000 // 5 minutes

  private readonly maxClockSkew: number = 60 * 1000 // 1 minute

  constructor(
    private readonly configService: ConfigService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly nonceService: NonceService
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
    // Extract the environment variable name from request metadata
    // This should be set by the @SignaturePublicKey() decorator
    const envVarName = req.signaturePublicKeyEnvVar

    if (!envVarName) {
      throw this.throwerErrorGuard.UnauthorizedException(
        ErrorsEnum.UNAUTHORIZED_ERROR,
        ErrorsResponseEnum.UNAUTHORIZED_ERROR,
        'Server configuration error: Public key environment variable not specified'
      )
    }

    const publicKey = this.configService.get<string>(envVarName)
    if (!publicKey) {
      throw this.throwerErrorGuard.UnauthorizedException(
        ErrorsEnum.UNAUTHORIZED_ERROR,
        ErrorsResponseEnum.UNAUTHORIZED_ERROR,
        `Server configuration error: Public key ${req.signaturePublicKeyEnvVar} not configured.`
      )
    }

    if (!this.isValidPublicKeyPem(publicKey)) {
      throw this.throwerErrorGuard.UnauthorizedException(
        ErrorsEnum.UNAUTHORIZED_ERROR,
        ErrorsResponseEnum.UNAUTHORIZED_ERROR,
        'Server configuration error: Invalid public key format'
      )
    }

    const signature = req.headers['x-signature']
    const timestamp = req.headers['x-timestamp']

    if (!signature || typeof signature !== 'string') {
      throw this.throwerErrorGuard.UnauthorizedException(
        ErrorsEnum.UNAUTHORIZED_ERROR,
        ErrorsResponseEnum.UNAUTHORIZED_ERROR,
        'Missing X-Signature header'
      )
    }

    if (!timestamp || typeof timestamp !== 'string') {
      throw this.throwerErrorGuard.UnauthorizedException(
        ErrorsEnum.UNAUTHORIZED_ERROR,
        ErrorsResponseEnum.UNAUTHORIZED_ERROR,
        'Missing X-Timestamp header'
      )
    }

    // We tried to find a smarter way to test this.
    if (!/^\d{10}(\d{3})?$/.test(timestamp)) {
      throw this.throwerErrorGuard.UnauthorizedException(
        ErrorsEnum.UNAUTHORIZED_ERROR,
        ErrorsResponseEnum.UNAUTHORIZED_ERROR,
        'Invalid X-Timestamp format. Must be Unix timestamp in seconds or milliseconds (10 or 13 digits)'
      )
    }

    const requestTime = parseInt(timestamp, 10)
    if (requestTime <= 0) {
      throw this.throwerErrorGuard.UnauthorizedException(
        ErrorsEnum.UNAUTHORIZED_ERROR,
        ErrorsResponseEnum.UNAUTHORIZED_ERROR,
        'Invalid X-Timestamp format. Must be Unix timestamp in milliseconds'
      )
    }

    const now = Date.now()
    const age = now - requestTime

    if (age > this.maxTimestampAge) {
      throw this.throwerErrorGuard.UnauthorizedException(
        ErrorsEnum.UNAUTHORIZED_ERROR,
        ErrorsResponseEnum.UNAUTHORIZED_ERROR,
        `Request timestamp too old. Age: ${age}ms, Max: ${this.maxTimestampAge}ms`
      )
    }

    if (age < -this.maxClockSkew) {
      throw this.throwerErrorGuard.UnauthorizedException(
        ErrorsEnum.UNAUTHORIZED_ERROR,
        ErrorsResponseEnum.UNAUTHORIZED_ERROR,
        'Request timestamp is in the future. Check your system clock.'
      )
    }

    // Construct the data that should have been signed
    // Format: METHOD|PATH|TIMESTAMP|BODY
    // This prevents signature reuse across different requests
    const method = req.method
    const originalUrl = req.originalUrl
    const body = JSON.stringify(req.body || {})
    const dataToVerify = `${method}|${originalUrl}|${timestamp}|${body}`

    // Verify signature using RSA-SHA256
    let isValid = false
    try {
      const verifier = createVerify('RSA-SHA256')
      verifier.update(dataToVerify)
      verifier.end()

      // Verify the signature against the public key
      isValid = verifier.verify(publicKey, signature, 'base64')

      if (!isValid) {
        throw this.throwerErrorGuard.UnauthorizedException(
          ErrorsEnum.UNAUTHORIZED_ERROR,
          ErrorsResponseEnum.UNAUTHORIZED_ERROR,
          'Invalid signature'
        )
      }

      await this.validateNonceOrThrow(req, envVarName)

      return true
    } catch (error) {
      // Re-throw if it's already our exception
      if (error instanceof HttpException) {
        throw error
      }

      // Wrap other errors
      throw this.throwerErrorGuard.UnauthorizedException(
        ErrorsEnum.UNAUTHORIZED_ERROR,
        ErrorsResponseEnum.UNAUTHORIZED_ERROR,
        'Signature verification failed',
        error instanceof Error ? error : undefined
      )
    }
  }

  private async validateNonceOrThrow(req: SignatureRequest, envVarName: string) {
    const nonce = req.headers['x-nonce']

    if (!req.requireNonce && typeof nonce === 'undefined') {
      return // Nonce is not required and is not present
    }

    if (typeof nonce !== 'string') {
      throw this.throwerErrorGuard.UnauthorizedException(
        ErrorsEnum.UNAUTHORIZED_ERROR,
        ErrorsResponseEnum.UNAUTHORIZED_ERROR,
        'Missing X-Nonce header or header is not string. This endpoint requires nonce-based replay protection.'
      )
    }

    await this.nonceService.validateAndMarkUsed(nonce, envVarName)
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
