export interface PartnerConfig {
  clientId: string
  clientSecret: string
  cognitoClientSecret: string
  name: string
  allowedRedirectUris: string[]
}

export enum PartnerId {
  DPB = 'DPB',
  MPA = 'MPA',
}

/**
 * Partner configurations
 * Each partner has:
 * - clientId: The client ID used by the partner to authenticate with our OAuth service
 * - clientSecret: The client secret used by the partner to authenticate with our OAuth service
 * - cognitoClientSecret: The secret we use to authenticate with Cognito on behalf of this partner
 * - name: Partner display name
 * - allowedRedirectUris: List of allowed redirect URIs for this partner
 */
export const getPartnerConfigs = (): Record<PartnerId, PartnerConfig> => {
  // Validate required environment variables
  const requiredEnvVars = [
    'OAUTH_DPB_CLIENT_ID',
    'OAUTH_DPB_CLIENT_SECRET',
    'OAUTH_DPB_COGNITO_SECRET',
    'OAUTH_DPB_REDIRECT_URIS',
    'OAUTH_MPA_CLIENT_ID',
    'OAUTH_MPA_CLIENT_SECRET',
    'OAUTH_MPA_COGNITO_SECRET',
    'OAUTH_MPA_REDIRECT_URIS',
  ]

  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required OAuth environment variables: ${missingVars.join(', ')}`
    )
  }

  return {
    [PartnerId.DPB]: {
      clientId: process.env.OAUTH_DPB_CLIENT_ID!,
      clientSecret: process.env.OAUTH_DPB_CLIENT_SECRET!,
      cognitoClientSecret: process.env.OAUTH_DPB_COGNITO_SECRET!,
      name: 'DPB Partner',
      allowedRedirectUris: process.env.OAUTH_DPB_REDIRECT_URIS!.split(',').map((uri) =>
        uri.trim()
      ),
    },
    [PartnerId.MPA]: {
      clientId: process.env.OAUTH_MPA_CLIENT_ID!,
      clientSecret: process.env.OAUTH_MPA_CLIENT_SECRET!,
      cognitoClientSecret: process.env.OAUTH_MPA_COGNITO_SECRET!,
      name: 'MPA Partner',
      allowedRedirectUris: process.env.OAUTH_MPA_REDIRECT_URIS!.split(',').map((uri) =>
        uri.trim()
      ),
    },
  }
}

export const findPartnerByClientId = (clientId: string): PartnerConfig | undefined => {
  const configs = getPartnerConfigs()
  return Object.values(configs).find((config) => config.clientId === clientId)
}
