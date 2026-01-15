import { Injectable } from '@nestjs/common'
import { LineLoggerSubservice } from '../../utils/subservices/line-logger.subservice'

/**
 * Well-known OAuth2 client names
 * These correspond to the prefixes used in OAUTH2_CLIENT_LIST environment variable
 */
export enum OAuth2ClientName {
  PAAS_MPA = 'PAAS_MPA',
  DPB = 'DPB',
}

/**
 * OAuth2 Client Configuration
 *
 * Configuration is loaded from environment variables with the following pattern:
 *
 * @example Example environment variables:
 * ```bash
 * # List of client prefixes
 * OAUTH2_CLIENT_LIST=DPB,PAAS_MPA
 *
 * # For PAAS_MPA client:
 * OAUTH2_PAAS_MPA_CLIENT_ID=my-client-id
 * OAUTH2_PAAS_MPA_CLIENT_SECRET=my-secret-key
 * OAUTH2_PAAS_MPA_ALLOWED_URIS=http://localhost:3000/callback,https://paas-mpa.example.com/callback
 * OAUTH2_PAAS_MPA_ALLOWED_SCOPES=openid,profile,email
 * OAUTH2_PAAS_MPA_ALLOWED_GRANT_TYPES=authorization_code,refresh_token
 * OAUTH2_PAAS_MPA_REQUIRES_PKCE=true
 *
 * # For DPB client:
 * OAUTH2_DPB_CLIENT_ID=dpb-client-id
 * OAUTH2_DPB_CLIENT_SECRET=dpb-secret-key
 * OAUTH2_DPB_ALLOWED_URIS=https://dpb.example.com/callback
 * OAUTH2_DPB_TITLE=DPB Application
 * ```
 *
 * @required - OAUTH2_CLIENT_LIST, OAUTH2_{PREFIX}_CLIENT_ID
 * @optional - OAUTH2_{PREFIX}_CLIENT_SECRET
 * @required - OAUTH2_{PREFIX}_ALLOWED_URIS (at least one redirect URI required)
 * @optional - OAUTH2_{PREFIX}_ALLOWED_SCOPES, ALLOWED_GRANT_TYPES, REQUIRES_PKCE
 */

export class OAuth2Client {
  /** Unique client identifier */
  readonly id: string

  /** Client secret (optional - if not provided, secret validation is skipped) */
  readonly secret?: string

  /** Human-readable name for the client (always the prefix from OAUTH2_CLIENT_LIST) */
  readonly name: string

  /** List of allowed redirect URIs for this client */
  readonly allowedRedirectUris: string[]

  /** Scopes this client is allowed to request */
  readonly allowedScopes?: string[]

  /** Grant types this client is allowed to use */
  readonly allowedGrantTypes?: string[]

  /** Whether this client requires PKCE */
  readonly requiresPkce: boolean

  constructor(config: {
    id: string
    secret?: string
    name: string
    allowedRedirectUris: string[]
    allowedScopes?: string[]
    allowedGrantTypes?: string[]
    requiresPkce: boolean
  }) {
    this.id = config.id
    this.secret = config.secret
    this.name = config.name
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
   * Parse a comma-separated string into an array of trimmed, non-empty values
   *
   * @param value - The comma-separated string to parse (optional)
   * @returns Array of trimmed, non-empty strings
   */
  private parseCommaSeparatedList(value?: string): string[] {
    if (!value) {
      return []
    }
    return value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
  }

  /**
   * Load clients from environment variables
   * Environment variable pattern: OAUTH2_{PREFIX}_{PROPERTY}
   */
  private loadClientsFromEnv(): OAuth2Client[] {
    // Get well-known clients from enum
    const enumClientNames = Object.values(OAuth2ClientName)
    // Get clients from environment variable
    const envClientNames = this.parseCommaSeparatedList(process.env.OAUTH2_CLIENT_LIST)

    // Merge into a Set to avoid duplicates
    const clientNames = new Set<string>([...enumClientNames, ...envClientNames])

    if (clientNames.size === 0) {
      this.logger.warn(
        'No OAuth2 clients configured. No well-known clients found and OAUTH2_CLIENT_LIST is empty or not set.'
      )
      return []
    }

    const clients: OAuth2Client[] = []

    for (const name of clientNames) {
      const clientId = process.env[`OAUTH2_${name}_CLIENT_ID`]
      const clientSecret = process.env[`OAUTH2_${name}_CLIENT_SECRET`]

      if (!clientId) {
        this.logger.error(
          `Missing configuration for client name: ${name} - CLIENT_ID is required`,
          { alert: 1 }
        )
        continue
      }

      // Parse allowed redirect URIs (required - at least one must be configured)
      const allowedRedirectUris = this.parseCommaSeparatedList(
        process.env[`OAUTH2_${name}_ALLOWED_URIS`]
      )
      if (allowedRedirectUris.length === 0) {
        this.logger.error(
          `Invalid configuration for client name: ${name} - ALLOWED_URIS is required and must contain at least one URI`,
          { alert: 1 }
        )
        continue
      }

      // Parse optional comma-separated arrays (filter out empty values)
      const allowedScopes = this.parseCommaSeparatedList(
        process.env[`OAUTH2_${name}_ALLOWED_SCOPES`]
      )

      const allowedGrantTypes = this.parseCommaSeparatedList(
        process.env[`OAUTH2_${name}_ALLOWED_GRANT_TYPES`]
      )

      // Default to true if not specified
      const requiresPkce = process.env[`OAUTH2_${name}_REQUIRES_PKCE`] !== 'false'

      const client = new OAuth2Client({
        id: clientId,
        secret: clientSecret,
        name,
        allowedRedirectUris,
        allowedScopes,
        allowedGrantTypes,
        requiresPkce,
      })

      clients.push(client)
    }

    return clients
  }

  /**
   * Get all configured clients (lazy loaded from environment)
   */
  private getClients(): OAuth2Client[] {
    if (this.clients.length === 0) {
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
    return clients.find((client) => client.id === clientId)
  }

  /**
   * Find a client by client name
   *
   * @param clientName - The client name (prefix from OAUTH2_CLIENT_LIST) to search for
   * @returns The client configuration if found, undefined otherwise
   */
  findClientByName(clientName: string): OAuth2Client | undefined {
    const clients = this.getClients()
    return clients.find((client) => client.name === clientName)
  }
}
