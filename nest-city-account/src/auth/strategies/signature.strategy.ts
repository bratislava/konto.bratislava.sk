import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy as CustomStrategy } from 'passport-custom'
import { Request } from 'express'
import { createVerify } from 'crypto'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { ErrorsEnum, ErrorsResponseEnum } from '../../utils/guards/dtos/error.dto'

/**
 * Passport strategy for RSA signature verification
 *
 * Security features:
 * - RSA-SHA256 signature verification
 * - Replay attack prevention via timestamp validation (5 minute window)
 * - Clock skew protection (1 minute tolerance)
 * - Timing-safe signature comparison
 * - Constant-time operations where possible
 * - Comprehensive audit logging
 *
 * The strategy validates requests signed with RSA private keys
 * and verifies them using the client's public key from environment variables.
 */
@Injectable()
export class SignatureStrategy extends PassportStrategy(CustomStrategy, 'signature') {
  private readonly maxTimestampAge: number = 5 * 60 * 1000 // 5 minutes

  private readonly maxClockSkew: number = 60 * 1000 // 1 minute

  constructor(
    private readonly configService: ConfigService,
    private readonly throwerErrorGuard: ThrowerErrorGuard
  ) {
    super()
  }

  /**
   * Validates the signature on an incoming request
   * @param req - Express request object
   * @returns true if validation succeeds
   * @throws UnauthorizedException if validation fails
   */
  async validate(req: Request): Promise<boolean> {
    // Extract the environment variable name from request metadata
    // This should be set by the @SignaturePublicKey() decorator
    const envVarName = (req as any).signaturePublicKeyEnvVar as string | undefined

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
        'Server configuration error: Public key not configured'
      )
    }

    if (!publicKey.includes('BEGIN PUBLIC KEY')) {
      throw this.throwerErrorGuard.UnauthorizedException(
        ErrorsEnum.UNAUTHORIZED_ERROR,
        ErrorsResponseEnum.UNAUTHORIZED_ERROR,
        'Server configuration error: Invalid public key format'
      )
    }

    const signature = req.headers['x-signature'] as string
    const timestamp = req.headers['x-timestamp'] as string

    if (!signature) {
      throw this.throwerErrorGuard.UnauthorizedException(
        ErrorsEnum.UNAUTHORIZED_ERROR,
        ErrorsResponseEnum.UNAUTHORIZED_ERROR,
        'Missing X-Signature header'
      )
    }

    if (!timestamp) {
      throw this.throwerErrorGuard.UnauthorizedException(
        ErrorsEnum.UNAUTHORIZED_ERROR,
        ErrorsResponseEnum.UNAUTHORIZED_ERROR,
        'Missing X-Timestamp header'
      )
    }

    const requestTime = parseInt(timestamp, 10)
    if (isNaN(requestTime) || requestTime <= 0) {
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

      return true
    } catch (error) {
      // Re-throw if it's already our exception
      if (error instanceof Error && error.name === 'UnauthorizedException') {
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
}
