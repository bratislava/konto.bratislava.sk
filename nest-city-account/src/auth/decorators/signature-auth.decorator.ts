import { applyDecorators, UseGuards } from '@nestjs/common'
import { ApiHeader } from '@nestjs/swagger'
import { SignatureGuard } from '../guards/signature.guard'
import { SignaturePublicKeyEnvVarName } from './signature-public-key.decorator'
import { RequireNonce } from './require-nonce.decorator'

/**
 * Composite decorator for signature-based authentication
 *
 * Combines:
 * - @SignaturePublicKeyEnvVarName() - specifies which env var contains the public key
 * - @RequireNonce() - optionally requires nonce for replay protection
 * - @UseGuards(SignatureGuard) - applies the signature validation guard
 * - @ApiHeader() decorators - documents required headers in Swagger
 *
 * @param publicKeyEnvVarName - Name of environment variable containing the RSA public key
 * @param options - Optional configuration
 * @param options.requireNonce - Whether to require nonce-based replay protection (default: false)
 *
 * @example
 * ```typescript
 * @SignatureAuth('DPB_CLIENT_PUBLIC_KEY', { requireNonce: true })
 * @Get('list-users')
 * async listUsers() {
 *   // ...
 * }
 * ```
 */
export function SignatureAuth(
  publicKeyEnvVarName: string,
  options?: { requireNonce?: boolean }
) {
  const decorators = [
    SignaturePublicKeyEnvVarName(publicKeyEnvVarName),
    UseGuards(SignatureGuard),
    ApiHeader({
      name: 'X-Signature',
      required: true,
      description: 'Base64-encoded RSA-SHA256 signature of the signing string',
      schema: { type: 'string', example: 'aGVsbG8gd29ybGQ=...' },
    }),
    ApiHeader({
      name: 'X-Timestamp',
      required: true,
      description: 'Unix timestamp in milliseconds',
      schema: { type: 'string', example: '1234567890123' },
    }),
  ]

  if (options?.requireNonce) {
    decorators.splice(1, 0, RequireNonce())
    decorators.push(
      ApiHeader({
        name: 'X-Nonce',
        required: true,
        description: 'Unique nonce for replay protection (must be used only once)',
        schema: { type: 'string', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
      })
    )
  }

  return applyDecorators(...decorators)
}
