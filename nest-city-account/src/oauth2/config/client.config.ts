/**
 * OAuth2 Client Configuration
 * 
 * Configuration is loaded from environment variables with the following pattern:
 * 
 * @example Example environment variables:
 * ```bash
 * # List of client prefixes
 * OAUTH2_CLIENT_LIST=MPA,DPB
 * 
 * # For MPA client:
 * OAUTH2_MPA_CLIENT_ID=my-client-id
 * OAUTH2_MPA_CLIENT_SECRET=my-secret-key
 * OAUTH2_MPA_ALLOWED_URIS=http://localhost:3000/callback,https://mpa.example.com/callback
 * OAUTH2_MPA_ALLOWED_SCOPES=openid,profile,email
 * OAUTH2_MPA_ALLOWED_GRANT_TYPES=authorization_code,refresh_token
 * OAUTH2_MPA_CLIENT_NAME=MPA Client
 * OAUTH2_MPA_REQUIRES_PKCE=true
 * 
 * # For DPB client:
 * OAUTH2_DPB_CLIENT_ID=dpb-client-id
 * OAUTH2_DPB_CLIENT_SECRET=dpb-secret-key
 * OAUTH2_DPB_ALLOWED_URIS=https://dpb.example.com/callback
 * OAUTH2_DPB_CLIENT_NAME=DPB Client
 * ```
 * 
 * @required - OAUTH2_CLIENT_LIST, OAUTH2_{PREFIX}_CLIENT_ID, OAUTH2_{PREFIX}_CLIENT_SECRET
 * @optional - OAUTH2_{PREFIX}_ALLOWED_URIS, ALLOWED_SCOPES, ALLOWED_GRANT_TYPES, CLIENT_NAME, REQUIRES_PKCE, CLIENT_URI
 */

export interface ClientConfig {
  /** Unique client identifier */
  clientId: string
  
  /** Client secret (should be stored securely, hashed in production) */
  clientSecret: string
  
  /** Human-readable name for the client */
  clientName?: string
  
  /** List of allowed redirect URIs for this client */
  allowedRedirectUris: string[]
  
  /** Scopes this client is allowed to request */
  allowedScopes?: string[]
  
  /** Grant types this client is allowed to use */
  allowedGrantTypes?: string[]
  
  /** Whether this client requires PKCE */
  requiresPkce?: boolean
  
  /** Client application URI */
  clientUri?: string
}

/**
 * Load clients from environment variables
 * Environment variable pattern: OAUTH2_{PREFIX}_{PROPERTY}
 */
function loadClientsFromEnv(): ClientConfig[] {
  const clientList = process.env.OAUTH2_CLIENT_LIST
  if (!clientList) {
    console.warn('No OAUTH2_CLIENT_LIST environment variable found. No OAuth2 clients configured.')
    return []
  }

  const clientPrefixes = clientList.split(',').map(p => p.trim())
  const clients: ClientConfig[] = []

  for (const prefix of clientPrefixes) {
    const clientId = process.env[`OAUTH2_${prefix}_CLIENT_ID`]
    const clientSecret = process.env[`OAUTH2_${prefix}_CLIENT_SECRET`]

    if (!clientId || !clientSecret) {
      console.warn(`Missing configuration for client prefix: ${prefix}`)
      continue
    }

    // Parse comma-separated values
    const allowedRedirectUris = process.env[`OAUTH2_${prefix}_ALLOWED_URIS`]?.split(',').map(u => u.trim()) || []
    const allowedScopes = process.env[`OAUTH2_${prefix}_ALLOWED_SCOPES`]?.split(',').map(s => s.trim())
    const allowedGrantTypes = process.env[`OAUTH2_${prefix}_ALLOWED_GRANT_TYPES`]?.split(',').map(g => g.trim())

    const client: ClientConfig = {
      clientId,
      clientSecret,
      clientName: process.env[`OAUTH2_${prefix}_CLIENT_NAME`] || prefix,
      allowedRedirectUris,
      allowedScopes,
      allowedGrantTypes,
      requiresPkce: process.env[`OAUTH2_${prefix}_REQUIRES_PKCE`] === 'true',
      clientUri: process.env[`OAUTH2_${prefix}_CLIENT_URI`],
    }

    clients.push(client)
  }

  return clients
}

// Lazy load clients on first access
let CLIENTS: ClientConfig[] = []

/**
 * Get all configured clients (lazy loaded from environment)
 */
function getClients(): ClientConfig[] {
  if (CLIENTS.length === 0 && process.env.OAUTH2_CLIENT_LIST) {
    CLIENTS = loadClientsFromEnv()
  }
  return CLIENTS
}

/**
 * Find a client by client ID
 * 
 * @param clientId - The client identifier to search for
 * @returns The client configuration if found, undefined otherwise
 */
export function findClientById(clientId: string): ClientConfig | undefined {
  const clients = getClients()
  return clients.find(client => client.clientId === clientId)
}

/**
 * Get all registered clients
 * This might be useful for admin endpoints
 */
export function getAllClients(): ClientConfig[] {
  const clients = getClients()
  return clients.map(({ clientSecret, ...client }) => ({
    ...client,
    clientSecret: '***REDACTED***', // Never expose secrets
  }))
}

/**
 * Validate if a redirect URI is allowed for a client
 * 
 * @param client - The client configuration
 * @param redirectUri - The redirect URI to validate
 * @returns True if the redirect URI is allowed
 */
export function isRedirectUriAllowed(client: ClientConfig, redirectUri: string): boolean {
  return client.allowedRedirectUris.includes(redirectUri)
}

/**
 * Validate if a scope is allowed for a client
 * 
 * @param client - The client configuration
 * @param requestedScope - The requested scope string
 * @returns True if all requested scopes are allowed
 */
export function areScopesAllowed(client: ClientConfig, requestedScope: string): boolean {
  if (!client.allowedScopes || client.allowedScopes.length === 0) {
    return true // No restrictions
  }
  
  const requestedScopes = requestedScope.split(' ').filter(s => s.length > 0)
  return requestedScopes.every(scope => client.allowedScopes?.includes(scope))
}

/**
 * Validate if a grant type is allowed for a client
 * 
 * @param client - The client configuration
 * @param grantType - The grant type to validate
 * @returns True if the grant type is allowed
 */
export function isGrantTypeAllowed(client: ClientConfig, grantType: string): boolean {
  if (!client.allowedGrantTypes || client.allowedGrantTypes.length === 0) {
    return true // No restrictions
  }
  
  return client.allowedGrantTypes.includes(grantType)
}

