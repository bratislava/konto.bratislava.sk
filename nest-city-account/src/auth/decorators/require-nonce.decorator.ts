import { SetMetadata } from '@nestjs/common'

export const REQUIRE_NONCE = 'require_nonce'

/**
 * Decorator to require nonce-based replay protection for an endpoint
 *
 * When applied, the endpoint will require an X-Nonce header in addition to
 * the standard signature authentication (X-Signature and X-Timestamp).
 * The nonce must be unique per request and will be validated against Redis cache.
 *
 * This decorator should be used on mutating endpoints (POST/PUT/DELETE) to prevent
 * replay attacks within the timestamp validation window.
 *
 * @example
 * ```ts
 *   @Post('mutating-endpoint')
 *   @SignaturePublicKeyEnvVarName('CLIENT_PUBLIC_KEY')
 *   @RequireNonce()
 *   @UseGuards(SignatureGuard)
 *   async createResource() { ... }
 * ```
 */
export const RequireNonce = () => SetMetadata(REQUIRE_NONCE, true)
