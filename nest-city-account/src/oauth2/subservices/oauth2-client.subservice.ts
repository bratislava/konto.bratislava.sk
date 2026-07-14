import { Injectable } from '@nestjs/common'

import BaConfigService from '../../config/ba-config.service'

export enum OAuth2ClientAllowedScopes {
  IDENTITY_VERIFIED = 'identity:verified',
}

/**
 * OAuth2 Client Configuration
 *
 * Parsed and validated from environment variables by parseOAuth2ClientsFromEnv (see
 * src/oauth2/oauth2-client-env.parser.ts) as part of config validation, and exposed via
 * BaConfigService.oauth2.clients. See that file for the OAUTH2_{PREFIX}_* variable pattern
 * and requirements.
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
    if (!requestedScope || requestedScope.length === 0) {
      return true // No scopes requested
    }
    if (!this.allowedScopes || this.allowedScopes.length === 0) {
      return false // No scopes allowed
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
      return false // No grant types allowed
    }

    return this.allowedGrantTypes.includes(grantType)
  }
}

/**
 * Subservice for OAuth2 client configuration management
 * Clients themselves are parsed and validated from environment variables during config
 * validation (see src/oauth2/oauth2-client-env.parser.ts) - this subservice only wraps
 * the already-validated data in OAuth2Client instances and looks them up.
 */
@Injectable()
export class OAuth2ClientSubservice {
  private clients: OAuth2Client[]

  constructor(private readonly baConfigService: BaConfigService) {
    this.clients = this.loadClients()
  }

  private loadClients(): OAuth2Client[] {
    return this.baConfigService.oauth2.clients.map((client) => new OAuth2Client(client))
  }

  /**
   * Get all configured clients, loaded eagerly at construction time.
   * Falls back to reloading from config if the clients were cleared.
   */
  private getClients(): OAuth2Client[] {
    if (this.clients.length === 0) {
      this.clients = this.loadClients()
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
    return this.getClients().find((client) => client.id === clientId)
  }

  /**
   * Find a client by client name
   *
   * @param clientName - The client name (prefix from OAUTH2_CLIENT_LIST) to search for
   * @returns The client configuration if found, undefined otherwise
   */
  findClientByName(clientName: string): OAuth2Client | undefined {
    return this.getClients().find((client) => client.name === clientName)
  }
}
