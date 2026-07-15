/**
 * Well-known clients authenticating via RSA signature (see SignatureStrategy).
 * Each member corresponds to a required {NAME}_CLIENT_PUBLIC_KEY environment variable,
 * validated at startup and exposed via BaConfigService.signaturePublicKey.
 */
export enum SignaturePublicKey {
  DPB = 'DPB',
}
