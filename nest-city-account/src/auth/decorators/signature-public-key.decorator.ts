import { SetMetadata } from '@nestjs/common'

export const SIGNATURE_PUBLIC_KEY = 'signature_public_key'

/**
 * Decorator to specify the environment variable name containing the public key for signature verification
 * @param envVarName - The name of the environment variable containing the public key
 * @example
 * ```ts
 *   @SignaturePublicKey('DPB_CLIENT_PUBLIC_KEY')
 *   @UseGuards(SignatureGuard)
 * ```
 */
export const SignaturePublicKey = (envVarName: string) =>
  SetMetadata(SIGNATURE_PUBLIC_KEY, envVarName)
