import { Request } from 'express'

export interface SignatureRequest extends Request {
  /**
   * Environment variable name containing the public key for signature verification
   * Set by @SignaturePublicKey decorator via SignatureGuard
   */
  signaturePublicKeyEnvVar?: string
}
