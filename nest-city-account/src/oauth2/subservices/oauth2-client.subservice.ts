import { Injectable } from '@nestjs/common'
import { LineLoggerSubservice } from '../../utils/subservices/line-logger.subservice'

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

export class OAuth2Client {
  /** Unique client identifier */
  readonly clientId: string

  /** Client secret (optional - if not provided, secret validation is skipped) */
  readonly clientSecret?: string

  /** Human-readable name for the client (always the prefix from OAUTH2_CLIENT_LIST) */
  readonly clientName: string

  /** List of allowed redirect URIs for this client */
  readonly allowedRedirectUris: string[]

  /** Scopes this client is allowed to request */
  readonly allowedScopes?: string[]

  /** Grant types this client is allowed to use */
  readonly allowedGrantTypes?: string[]

  /** Whether this client requires PKCE */
  readonly requiresPkce: boolean

  constructor(config: {
    clientId: string
    clientSecret?: string
    clientName: string
    allowedRedirectUris: string[]
    allowedScopes?: string[]
    allowedGrantTypes?: string[]
    requiresPkce: boolean
  }) {
    this.clientId = config.clientId
    this.clientSecret = config.clientSecret
    this.clientName = config.clientName
    this.allowedRedirectUris = config.allowedRedirectUris
    this.allowedScopes = config.allowedScopes
    this.allowedGrantTypes = config.allowedGrantTypes
    this.requiresPkce = config.requiresPkce
  }

  /**
   * Validate if a redirect URI is allowed for this client
   *
   * @param redirectUri - The redirect URI to validate
   * @returns True if the redirect URI is allowed
   */
  isRedirectUriAllowed(redirectUri: string): boolean {
    return this.allowedRedirectUris.includes(redirectUri)
  }

  /**
   * Validate if all requested scopes are allowed for this client
   *
   * @param requestedScope - The requested scope string (space-delimited list of scopes)
   * @returns True if all requested scopes are allowed
   */
  areAllScopesAllowed(requestedScope: string): boolean {
    if (!this.allowedScopes || this.allowedScopes.length === 0) {
      return true // No restrictions
    }

    const requestedScopes = requestedScope.split(' ').filter((s) => s.length > 0)
    return requestedScopes.every((scope) => this.allowedScopes?.includes(scope))
  }

  /**
   * Validate if a grant type is allowed for this client
   *
   * @param grantType - The grant type to validate
   * @returns True if the grant type is allowed
   */
  isGrantTypeAllowed(grantType: string): boolean {
    if (!this.allowedGrantTypes || this.allowedGrantTypes.length === 0) {
      return true // No restrictions
    }

    return this.allowedGrantTypes.includes(grantType)
  }
}

/**
 * Subservice for OAuth2 client configuration management
 * Loads and manages client configurations from environment variables
 */
@Injectable()
export class OAuth2ClientSubservice {
  private readonly logger: LineLoggerSubservice

  private clients: OAuth2Client[] = []

  constructor() {
    this.logger = new LineLoggerSubservice(OAuth2ClientSubservice.name)
  }

  /**
   * Load clients from environment variables
   * Environment variable pattern: OAUTH2_{PREFIX}_{PROPERTY}
   */
  private loadClientsFromEnv(): OAuth2Client[] {
    const clientList = process.env.OAUTH2_CLIENT_LIST
    if (!clientList || clientList.trim().length === 0) {
      this.logger.warn(
        'No OAUTH2_CLIENT_LIST environment variable found or it is empty. No OAuth2 clients configured.'
      )
      return []
    }

    const clientPrefixes = clientList
      .split(',')
      .map((p) => p.trim())
      .filter((p) => p.length > 0) // Filter out empty strings (e.g., from "MPA,,DPB" or ",MPA,")
    const clients: OAuth2Client[] = []

    for (const prefix of clientPrefixes) {
      const clientId = process.env[`OAUTH2_${prefix}_CLIENT_ID`]
      const clientSecret = process.env[`OAUTH2_${prefix}_CLIENT_SECRET`]

      if (!clientId) {
        this.logger.error(
          `Missing configuration for client prefix: ${prefix} - CLIENT_ID is required`
        )
        continue
      }

      // Parse allowed redirect URIs (required - at least one must be configured)
      const allowedRedirectUrisEnv = process.env[`OAUTH2_${prefix}_ALLOWED_URIS`]
      if (!allowedRedirectUrisEnv) {
        this.logger.error(
          `Missing configuration for client prefix: ${prefix} - ALLOWED_URIS is required`
        )
        continue
      }
      const allowedRedirectUris = allowedRedirectUrisEnv
        .split(',')
        .map((u) => u.trim())
        .filter((u) => u.length > 0)
      if (allowedRedirectUris.length === 0) {
        this.logger.error(
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

      // Default to true if not specified
      const requiresPkce = process.env[`OAUTH2_${prefix}_REQUIRES_PKCE`] !== 'false'

      const client = new OAuth2Client({
        clientId,
        clientName: prefix, // Always use the prefix as the client name
        allowedRedirectUris,
        requiresPkce,
        ...(clientSecret && { clientSecret }), // Only include if provided
        ...(allowedScopes && allowedScopes.length > 0 && { allowedScopes }), // Only include if non-empty
        ...(allowedGrantTypes && allowedGrantTypes.length > 0 && { allowedGrantTypes }), // Only include if non-empty
      })

      clients.push(client)
    }

    return clients
  }

  /**
   * Get all configured clients (lazy loaded from environment)
   */
  private getClients(): OAuth2Client[] {
    if (this.clients.length === 0 && process.env.OAUTH2_CLIENT_LIST) {
      this.clients = this.loadClientsFromEnv()
    }
    return this.clients
  }

  /**
   * Find a client by client ID
   *
   * @param clientId - The client identifier to search for
   * @returns The client configuration if found, undefined otherwise
   */
  findClientById(clientId: string): OAuth2Client | undefined {
    const clients = this.getClients()
    return clients.find((client) => client.clientId === clientId)
  }
}
