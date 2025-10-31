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
 * OAUTH2_MPA_REQUIRES_PKCE=true
 *
 * # For DPB client:
 * OAUTH2_DPB_CLIENT_ID=dpb-client-id
 * OAUTH2_DPB_CLIENT_SECRET=dpb-secret-key
 * OAUTH2_DPB_ALLOWED_URIS=https://dpb.example.com/callback
 * ```
 *
 * @required - OAUTH2_CLIENT_LIST, OAUTH2_{PREFIX}_CLIENT_ID
 * @optional - OAUTH2_{PREFIX}_CLIENT_SECRET
 * @required - OAUTH2_{PREFIX}_ALLOWED_URIS (at least one redirect URI required)
 * @optional - OAUTH2_{PREFIX}_ALLOWED_SCOPES, ALLOWED_GRANT_TYPES, REQUIRES_PKCE
 */

export interface ClientConfig {
  /** Unique client identifier */
  clientId: string

  /** Client secret (optional - if not provided, secret validation is skipped) */
  clientSecret?: string

  /** Human-readable name for the client (always the prefix from OAUTH2_CLIENT_LIST) */
  clientName: string

  /** List of allowed redirect URIs for this client */
  allowedRedirectUris: string[]

  /** Scopes this client is allowed to request */
  allowedScopes?: string[]

  /** Grant types this client is allowed to use */
  allowedGrantTypes?: string[]

  /** Whether this client requires PKCE */
  requiresPkce?: boolean
}

/**
 * Load clients from environment variables
 * Environment variable pattern: OAUTH2_{PREFIX}_{PROPERTY}
 */
function loadClientsFromEnv(): ClientConfig[] {
  const clientList = process.env.OAUTH2_CLIENT_LIST
  if (!clientList || clientList.trim().length === 0) {
    console.warn(
      'No OAUTH2_CLIENT_LIST environment variable found or it is empty. No OAuth2 clients configured.'
    )
    return []
  }

  const clientPrefixes = clientList
    .split(',')
    .map((p) => p.trim())
    .filter((p) => p.length > 0) // Filter out empty strings (e.g., from "MPA,,DPB" or ",MPA,")
  const clients: ClientConfig[] = []

  for (const prefix of clientPrefixes) {
    const clientId = process.env[`OAUTH2_${prefix}_CLIENT_ID`]
    const clientSecret = process.env[`OAUTH2_${prefix}_CLIENT_SECRET`]

    if (!clientId) {
      console.warn(`Missing configuration for client prefix: ${prefix} - CLIENT_ID is required`)
      continue
    }

    // Parse allowed redirect URIs (required - at least one must be configured)
    const allowedRedirectUrisEnv = process.env[`OAUTH2_${prefix}_ALLOWED_URIS`]
    if (!allowedRedirectUrisEnv) {
      console.warn(`Missing configuration for client prefix: ${prefix} - ALLOWED_URIS is required`)
      continue
    }
    const allowedRedirectUris = allowedRedirectUrisEnv
      .split(',')
      .map((u) => u.trim())
      .filter((u) => u.length > 0)
    if (allowedRedirectUris.length === 0) {
      console.warn(
        `Invalid configuration for client prefix: ${prefix} - ALLOWED_URIS must contain at least one URI`
      )
      continue
    }

    // Parse optional comma-separated arrays (filter out empty values)
    const allowedScopesEnv = process.env[`OAUTH2_${prefix}_ALLOWED_SCOPES`]
    const allowedScopes = allowedScopesEnv
      ?.split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)

    const allowedGrantTypesEnv = process.env[`OAUTH2_${prefix}_ALLOWED_GRANT_TYPES`]
    const allowedGrantTypes = allowedGrantTypesEnv
      ?.split(',')
      .map((g) => g.trim())
      .filter((g) => g.length > 0)

    const requiresPkce = process.env[`OAUTH2_${prefix}_REQUIRES_PKCE`] === 'true'

    const client: ClientConfig = {
      clientId,
      clientName: prefix, // Always use the prefix as the client name
      allowedRedirectUris,
      requiresPkce,
      ...(clientSecret && { clientSecret }), // Only include if provided
      ...(allowedScopes && allowedScopes.length > 0 && { allowedScopes }), // Only include if non-empty
      ...(allowedGrantTypes && allowedGrantTypes.length > 0 && { allowedGrantTypes }), // Only include if non-empty
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
  return clients.find((client) => client.clientId === clientId)
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

  const requestedScopes = requestedScope.split(' ').filter((s) => s.length > 0)
  return requestedScopes.every((scope) => client.allowedScopes?.includes(scope))
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
