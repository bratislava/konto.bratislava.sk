import { SetMetadata } from '@nestjs/common'

import { SignaturePublicKey } from '../types/signature-public-key.enum'

export const SIGNATURE_PUBLIC_KEY = 'signature_public_key'

/**
 * Decorator to specify which well-known client's public key to use for signature verification
 * @param publicKeyName - The SignaturePublicKey enum member identifying the client
 * @example
 * ```ts
 *   @SignaturePublicKeyName(SignaturePublicKey.DPB)
 *   @UseGuards(SignatureGuard)
 * ```
 */
export const SignaturePublicKeyName = (publicKeyName: SignaturePublicKey) =>
  SetMetadata(SIGNATURE_PUBLIC_KEY, publicKeyName)
