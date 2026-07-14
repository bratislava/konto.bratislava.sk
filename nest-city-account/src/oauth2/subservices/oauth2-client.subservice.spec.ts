import { Test, TestingModule } from '@nestjs/testing'

import BaConfigService from '../../config/ba-config.service'
import { OAuth2ClientEnvConfig } from '../oauth2-client-env.parser'
import { OAuth2Client, OAuth2ClientSubservice } from './oauth2-client.subservice'

function makeClientConfig(overrides: Partial<OAuth2ClientEnvConfig> = {}): OAuth2ClientEnvConfig {
  return {
    id: 'paas-id',
    name: 'PAAS_MPA',
    allowedRedirectUris: ['https://paas.example.com/cb'],
    allowedScopes: [],
    allowedGrantTypes: [],
    requiresPkce: true,
    ...overrides,
  }
}

describe('OAuth2Client', () => {
  /**
   * Redirect URI Validation
   *
   * RFC 6749 Section 3.1.2.3 - Exact string comparison per RFC 3986 Section 6.2.1
   * RFC 6819 Section 5.2.3.5 - Validate pre-registered redirect_uri
   */
  describe('isRedirectUriAllowed', () => {
    const client = new OAuth2Client({
      id: 'test-id',
      name: 'TEST',
      requiresPkce: true,
      allowedRedirectUris: ['https://example.com/callback', 'https://example.com/alt-callback'],
    })

    it('should return true for a registered redirect URI', () => {
      expect(client.isRedirectUriAllowed('https://example.com/callback')).toBe(true)
    })

    it('should return false for an unregistered redirect URI', () => {
      expect(client.isRedirectUriAllowed('https://malicious.com/callback')).toBe(false)
    })

    it('should return false for a partial match', () => {
      expect(client.isRedirectUriAllowed('https://example.com')).toBe(false)
      expect(client.isRedirectUriAllowed('https://example.com/callback/extra')).toBe(false)
    })

    it('should support multiple registered redirect URIs', () => {
      expect(client.isRedirectUriAllowed('https://example.com/callback')).toBe(true)
      expect(client.isRedirectUriAllowed('https://example.com/alt-callback')).toBe(true)
    })

    it('should reject a URI matching a wildcard in the registered URI (exact match only)', () => {
      // RFC 6749 Section 3.1.2.3 requires exact matching — wildcards must NOT be expanded.
      const wildcardClient = new OAuth2Client({
        id: 'wildcard-id',
        name: 'WILDCARD',
        requiresPkce: true,
        allowedRedirectUris: ['https://example.com/*'],
      })
      expect(wildcardClient.isRedirectUriAllowed('https://example.com/callback')).toBe(false)
      // Only a verbatim match of the registered (wildcard) string is accepted.
      expect(wildcardClient.isRedirectUriAllowed('https://example.com/*')).toBe(true)
    })

    it('should reject a provided URI that itself contains a wildcard', () => {
      // A wildcard in the provided redirect_uri can never match a concrete registered URI.
      expect(client.isRedirectUriAllowed('https://example.com/callbac*')).toBe(false)
    })
  })

  /**
   * Scope Validation
   *
   * RFC 6749 Section 3.3 - Space-delimited, case-sensitive scope strings
   */
  describe('areAllScopesAllowed', () => {
    const client = new OAuth2Client({
      id: 'test-id',
      name: 'TEST',
      requiresPkce: true,
      allowedRedirectUris: ['https://example.com/cb'],
      allowedScopes: ['openid', 'profile', 'email', 'identity:verified'],
    })

    it('should return true when all requested scopes are allowed', () => {
      expect(client.areAllScopesAllowed('openid profile')).toBe(true)
    })

    it('should return true for a single allowed scope', () => {
      expect(client.areAllScopesAllowed('email')).toBe(true)
    })

    it('should return true for an allowed scope containing a colon (identity:verified)', () => {
      // The colon is part of the scope token, not a delimiter — scopes are space-delimited only.
      expect(client.areAllScopesAllowed('identity:verified')).toBe(true)
      expect(client.areAllScopesAllowed('openid identity:verified')).toBe(true)
    })

    it('should return false when any scope is not allowed', () => {
      expect(client.areAllScopesAllowed('openid admin')).toBe(false)
    })

    it('should return true for empty scope string', () => {
      expect(client.areAllScopesAllowed('')).toBe(true)
    })

    it('should return false when no allowedScopes configured', () => {
      const noScopeClient = new OAuth2Client({
        id: 'x',
        name: 'X',
        requiresPkce: true,
        allowedRedirectUris: ['https://example.com/cb'],
      })
      expect(noScopeClient.areAllScopesAllowed('openid')).toBe(false)
    })

    it('should return true for empty scope string even when no allowedScopes configured', () => {
      // No scope requested is always valid, regardless of what the client is allowed to request.
      const noScopeClient = new OAuth2Client({
        id: 'x',
        name: 'X',
        requiresPkce: true,
        allowedRedirectUris: ['https://example.com/cb'],
      })
      expect(noScopeClient.areAllScopesAllowed('')).toBe(true)
    })

    it('should handle space-delimited scope strings correctly', () => {
      expect(client.areAllScopesAllowed('openid profile email')).toBe(true)
      expect(client.areAllScopesAllowed('openid unknown email')).toBe(false)
    })

    it('should handle multiple spaces between scopes (filter empty splits)', () => {
      // CUSTOM PROXY DETAIL: .split(' ').filter(s => s.length > 0) removes empty strings from double-spaces.
      // RFC 6749 Section 3.3 says scopes are space-delimited, but doesn't address how to tolerate
      // multiple consecutive spaces — this is our implementation choice.
      expect(client.areAllScopesAllowed('openid  profile')).toBe(true)
    })

    it('should return false when allowedScopes is empty array (vs undefined)', () => {
      // Empty array [] is falsy for .length === 0 check — distinct from undefined
      const emptyArrayClient = new OAuth2Client({
        id: 'x',
        name: 'X',
        requiresPkce: true,
        allowedRedirectUris: ['https://example.com/cb'],
        allowedScopes: [],
      })
      expect(emptyArrayClient.areAllScopesAllowed('openid')).toBe(false)
    })
  })

  /**
   * Grant Type Validation
   *
   * CUSTOM PROXY DETAIL: Per-client grant type restriction. RFC 6749 Section 3.2.1
   * allows the authorization server to restrict grants per client; the registry
   * mechanism for that is what's custom here.
   */
  describe('isGrantTypeAllowed', () => {
    const client = new OAuth2Client({
      id: 'test-id',
      name: 'TEST',
      requiresPkce: true,
      allowedRedirectUris: ['https://example.com/cb'],
      allowedGrantTypes: ['authorization_code', 'refresh_token'],
    })

    it('should return true for an allowed grant type', () => {
      expect(client.isGrantTypeAllowed('authorization_code')).toBe(true)
      expect(client.isGrantTypeAllowed('refresh_token')).toBe(true)
    })

    it('should return false for a disallowed grant type', () => {
      expect(client.isGrantTypeAllowed('client_credentials')).toBe(false)
    })

    it('should return false when no allowedGrantTypes configured', () => {
      const noGrantClient = new OAuth2Client({
        id: 'x',
        name: 'X',
        requiresPkce: true,
        allowedRedirectUris: ['https://example.com/cb'],
      })
      expect(noGrantClient.isGrantTypeAllowed('authorization_code')).toBe(false)
    })

    it('should return false for empty grant type when no allowedGrantTypes configured', () => {
      // Contrast with scope validation: an empty scope is allowed, but an empty grant type is not —
      // a grant type must always be explicitly allowed.
      const noGrantClient = new OAuth2Client({
        id: 'x',
        name: 'X',
        requiresPkce: true,
        allowedRedirectUris: ['https://example.com/cb'],
      })
      expect(noGrantClient.isGrantTypeAllowed('')).toBe(false)
    })
  })

  /**
   * Client Construction
   *
   * RFC 6749 Section 2.2 - Client identifier
   * RFC 6749 Section 2.1 - Confidential vs public client types
   */
  describe('constructor', () => {
    it('should store all configuration properties', () => {
      const client = new OAuth2Client({
        id: 'my-id',
        secret: 'my-secret',
        name: 'MY',
        allowedRedirectUris: ['https://example.com/cb'],
        allowedScopes: ['openid'],
        allowedGrantTypes: ['authorization_code'],
        requiresPkce: true,
      })
      expect(client.id).toBe('my-id')
      expect(client.secret).toBe('my-secret')
      expect(client.name).toBe('MY')
      expect(client.allowedRedirectUris).toEqual(['https://example.com/cb'])
      expect(client.allowedScopes).toEqual(['openid'])
      expect(client.allowedGrantTypes).toEqual(['authorization_code'])
      expect(client.requiresPkce).toBe(true)
    })

    it('should allow secret to be undefined (public client)', () => {
      const client = new OAuth2Client({
        id: 'pub',
        name: 'PUB',
        allowedRedirectUris: ['https://example.com/cb'],
        requiresPkce: true,
      })
      expect(client.secret).toBeUndefined()
    })

    it('should allow allowedScopes and allowedGrantTypes to be undefined', () => {
      const client = new OAuth2Client({
        id: 'min',
        name: 'MIN',
        allowedRedirectUris: ['https://example.com/cb'],
        requiresPkce: false,
      })
      expect(client.allowedScopes).toBeUndefined()
      expect(client.allowedGrantTypes).toBeUndefined()
    })
  })
})

/**
 * OAuth2ClientSubservice - Client Registry
 *
 * Client configuration itself is parsed and validated from environment variables during
 * config validation (see src/oauth2/oauth2-client-env.parser.ts and its spec) - an invalid
 * or missing OAUTH2_{PREFIX}_* variable fails application startup entirely. This subservice
 * only wraps the already-validated BaConfigService.oauth2.clients data in OAuth2Client
 * instances (adding the RFC-related helper methods tested above) and looks them up.
 *
 * CUSTOM PROXY DETAIL: RFC 6749 Section 2 explicitly leaves the registration mechanism out
 * of scope ("The means through which the client registers with the authorization server
 * are beyond the scope of this specification."), so an env-var registry is a valid implementation.
 */
describe('OAuth2ClientSubservice', () => {
  let clients: OAuth2ClientEnvConfig[]

  async function createService(): Promise<OAuth2ClientSubservice> {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OAuth2ClientSubservice,
        {
          provide: BaConfigService,
          useValue: {
            get oauth2() {
              return { clients }
            },
          },
        },
      ],
    }).compile()
    return module.get<OAuth2ClientSubservice>(OAuth2ClientSubservice)
  }

  beforeEach(() => {
    clients = []
  })

  it('should be defined', async () => {
    const service = await createService()
    expect(service).toBeDefined()
  })

  describe('wrapping validated config', () => {
    it('should wrap a validated client config into a fully-populated OAuth2Client instance', async () => {
      clients = [
        makeClientConfig({
          id: 'paas-id',
          secret: 'paas-secret',
          name: 'PAAS_MPA',
          allowedRedirectUris: ['https://paas.example.com/cb'],
          allowedScopes: ['openid', 'profile'],
          allowedGrantTypes: ['authorization_code', 'refresh_token'],
          requiresPkce: true,
        }),
      ]
      const service = await createService()
      const client = service.findClientById('paas-id')
      expect(client).toBeInstanceOf(OAuth2Client)
      expect(client!.id).toBe('paas-id')
      expect(client!.secret).toBe('paas-secret')
      expect(client!.name).toBe('PAAS_MPA')
      expect(client!.allowedRedirectUris).toEqual(['https://paas.example.com/cb'])
      expect(client!.allowedScopes).toEqual(['openid', 'profile'])
      expect(client!.allowedGrantTypes).toEqual(['authorization_code', 'refresh_token'])
      expect(client!.requiresPkce).toBe(true)
    })

    it('should wrap multiple configured clients', async () => {
      clients = [
        makeClientConfig({
          id: 'a-id',
          name: 'CLIENT_A',
          allowedRedirectUris: ['https://a.com/cb'],
        }),
        makeClientConfig({
          id: 'b-id',
          name: 'CLIENT_B',
          allowedRedirectUris: ['https://b.com/cb'],
        }),
      ]
      const service = await createService()
      expect(service.findClientById('a-id')).toBeDefined()
      expect(service.findClientById('b-id')).toBeDefined()
    })

    it('should handle optional fields being absent', async () => {
      clients = [
        makeClientConfig({
          id: 'paas-id',
          allowedRedirectUris: ['https://paas.com/cb'],
          secret: undefined,
          allowedScopes: [],
          allowedGrantTypes: [],
        }),
      ]
      const service = await createService()
      const client = service.findClientById('paas-id')!
      expect(client.secret).toBeUndefined()
      expect(client.allowedScopes).toEqual([])
      expect(client.allowedGrantTypes).toEqual([])
    })
  })

  /**
   * Eager Loading
   * CUSTOM PROXY DETAIL: Clients are loaded from BaConfigService once, at construction
   * time - not on first find call - so a subservice consumer never observes a partially
   * loaded registry. If cleared, getClients() falls back to reloading from config.
   */
  describe('eager loading', () => {
    it('should load clients at construction time', async () => {
      clients = [
        makeClientConfig({ id: 'paas-id', allowedRedirectUris: ['https://paas.example.com/cb'] }),
      ]
      const service = await createService()
      expect(service.findClientById('paas-id')).toBeDefined()
    })

    it('should self-heal by reloading from config if the internal client list was cleared', async () => {
      clients = [
        makeClientConfig({ id: 'paas-id', allowedRedirectUris: ['https://paas.example.com/cb'] }),
      ]
      const service = await createService()
      expect(service.findClientById('paas-id')).toBeDefined()

      // Simulate the internal cache having been cleared somehow.
      ;(service as unknown as { clients: OAuth2Client[] }).clients = []
      clients = [
        makeClientConfig({
          id: 'reloaded-id',
          allowedRedirectUris: ['https://reloaded.example.com/cb'],
        }),
      ]

      expect(service.findClientById('reloaded-id')).toBeDefined()
    })
  })

  /**
   * Client Lookup
   * RFC 6749 Section 2.2 - Client identifier is unique to the authorization server
   */
  describe('findClientById', () => {
    it('should find a client by its unique client_id', async () => {
      // RFC 6749 Section 2.2: Client identifier is unique to the authorization server
      clients = [
        makeClientConfig({
          id: 'paas-id',
          name: 'PAAS_MPA',
          allowedRedirectUris: ['https://paas.example.com/cb'],
        }),
      ]
      const service = await createService()
      const client = service.findClientById('paas-id')
      expect(client).toBeDefined()
      expect(client!.id).toBe('paas-id')
    })

    it('should return undefined for an unregistered client_id', async () => {
      // RFC 6749 Section 2.2: Unregistered client identifiers must not resolve
      clients = [
        makeClientConfig({
          id: 'paas-id',
          name: 'PAAS_MPA',
          allowedRedirectUris: ['https://paas.example.com/cb'],
        }),
      ]
      const service = await createService()
      expect(service.findClientById('nonexistent')).toBeUndefined()
    })
  })

  describe('findClientByName', () => {
    it('should find a client by its name (env prefix)', async () => {
      clients = [
        makeClientConfig({
          id: 'dpb-id',
          name: 'DPB',
          allowedRedirectUris: ['https://dpb.example.com/cb'],
        }),
      ]
      const service = await createService()
      const client = service.findClientByName('DPB')
      expect(client).toBeDefined()
      expect(client!.name).toBe('DPB')
    })

    it('should return undefined for an unknown client name', async () => {
      clients = [
        makeClientConfig({
          id: 'dpb-id',
          name: 'DPB',
          allowedRedirectUris: ['https://dpb.example.com/cb'],
        }),
      ]
      const service = await createService()
      expect(service.findClientByName('NONEXISTENT')).toBeUndefined()
    })
  })
})
