import { Request } from 'express'

export interface SignatureRequest extends Request {
  /**
   * Environment variable name containing the public key for signature verification
   * Set by @SignaturePublicKeyEnvVarName decorator via SignatureGuard
   */
  signaturePublicKeyEnvVar?: string

  /**
   * Whether nonce-based replay protection is required for this endpoint
   * Set by @RequireNonce() decorator via SignatureGuard
   */
  requireNonce?: boolean
}
