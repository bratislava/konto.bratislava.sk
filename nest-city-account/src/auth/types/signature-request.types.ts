import { Request } from 'express'

import { SignaturePublicKey } from './signature-public-key.enum'

export interface SignatureRequest extends Request {
  /**
   * Identifies which well-known client's public key to verify the signature against
   * Set by @SignaturePublicKeyName decorator via SignatureGuard
   */
  signaturePublicKeyName?: SignaturePublicKey

  /**
   * Whether nonce-based replay protection is required for this endpoint
   * Set by @RequireNonce() decorator via SignatureGuard
   */
  requireNonce?: boolean
}
