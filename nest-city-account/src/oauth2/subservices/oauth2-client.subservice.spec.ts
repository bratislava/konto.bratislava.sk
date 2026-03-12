import { Test, TestingModule } from '@nestjs/testing'

import { OAuth2Client, OAuth2ClientSubservice } from './oauth2-client.subservice'

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
      allowedScopes: ['openid', 'profile', 'email'],
    })

    it('should return true when all requested scopes are allowed', () => {
      expect(client.areAllScopesAllowed('openid profile')).toBe(true)
    })

    it('should return true for a single allowed scope', () => {
      expect(client.areAllScopesAllowed('email')).toBe(true)
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
        allowedRedirectUris: ['https://x.com/cb'],
      })
      expect(noScopeClient.areAllScopesAllowed('openid')).toBe(false)
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
        allowedRedirectUris: ['https://x.com/cb'],
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
        allowedRedirectUris: ['https://x.com/cb'],
      })
      expect(noGrantClient.isGrantTypeAllowed('authorization_code')).toBe(false)
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
        allowedRedirectUris: ['https://x.com/cb'],
        allowedScopes: ['openid'],
        allowedGrantTypes: ['authorization_code'],
        requiresPkce: true,
      })
      expect(client.id).toBe('my-id')
      expect(client.secret).toBe('my-secret')
      expect(client.name).toBe('MY')
      expect(client.allowedRedirectUris).toEqual(['https://x.com/cb'])
      expect(client.allowedScopes).toEqual(['openid'])
      expect(client.allowedGrantTypes).toEqual(['authorization_code'])
      expect(client.requiresPkce).toBe(true)
    })

    it('should allow secret to be undefined (public client)', () => {
      const client = new OAuth2Client({
        id: 'pub',
        name: 'PUB',
        allowedRedirectUris: ['https://x.com/cb'],
        requiresPkce: true,
      })
      expect(client.secret).toBeUndefined()
    })

    it('should allow allowedScopes and allowedGrantTypes to be undefined', () => {
      const client = new OAuth2Client({
        id: 'min',
        name: 'MIN',
        allowedRedirectUris: ['https://x.com/cb'],
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
 * CUSTOM PROXY DETAIL: Environment-variable-based client configuration. RFC 6749
 * Section 2 explicitly leaves the registration mechanism out of scope ("The means
 * through which the client registers with the authorization server are beyond the
 * scope of this specification."), so an env-var registry is a valid implementation.
 */
describe('OAuth2ClientSubservice', () => {
  let service: OAuth2ClientSubservice
  const ORIGINAL_ENV = process.env

  function setClientEnv(
    prefix: string,
    config: {
      clientId: string
      clientSecret?: string
      allowedUris: string
      allowedScopes?: string
      allowedGrantTypes?: string
      requiresPkce?: string
    }
  ) {
    process.env[`OAUTH2_${prefix}_CLIENT_ID`] = config.clientId
    if (config.clientSecret !== undefined)
      process.env[`OAUTH2_${prefix}_CLIENT_SECRET`] = config.clientSecret
    process.env[`OAUTH2_${prefix}_ALLOWED_URIS`] = config.allowedUris
    if (config.allowedScopes !== undefined)
      process.env[`OAUTH2_${prefix}_ALLOWED_SCOPES`] = config.allowedScopes
    if (config.allowedGrantTypes !== undefined)
      process.env[`OAUTH2_${prefix}_ALLOWED_GRANT_TYPES`] = config.allowedGrantTypes
    if (config.requiresPkce !== undefined)
      process.env[`OAUTH2_${prefix}_REQUIRES_PKCE`] = config.requiresPkce
  }

  beforeEach(async () => {
    jest.resetModules()
    process.env = { ...ORIGINAL_ENV }
    // Clear enum client env vars so tests control full state
    for (const key of Object.keys(process.env)) {
      if (key.startsWith('OAUTH2_')) delete process.env[key]
    }
    const module: TestingModule = await Test.createTestingModule({
      providers: [OAuth2ClientSubservice],
    }).compile()
    service = module.get<OAuth2ClientSubservice>(OAuth2ClientSubservice)
  })

  afterEach(() => {
    process.env = ORIGINAL_ENV
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  /**
   * Environment Variable Loading
   * CUSTOM PROXY DETAIL: OAUTH2_{PREFIX}_{PROPERTY} naming pattern is our convention.
   */
  describe('loadClientsFromEnv (via findClientById / findClientByName)', () => {
    it('should load a fully configured client from environment variables', () => {
      setClientEnv('PAAS_MPA', {
        clientId: 'paas-id',
        clientSecret: 'paas-secret',
        allowedUris: 'https://paas.example.com/cb',
        allowedScopes: 'openid,profile',
        allowedGrantTypes: 'authorization_code,refresh_token',
        requiresPkce: 'true',
      })
      const client = service.findClientById('paas-id')
      expect(client).toBeDefined()
      expect(client!.id).toBe('paas-id')
      expect(client!.secret).toBe('paas-secret')
      expect(client!.name).toBe('PAAS_MPA')
      expect(client!.allowedRedirectUris).toEqual(['https://paas.example.com/cb'])
      expect(client!.allowedScopes).toEqual(['openid', 'profile'])
      expect(client!.allowedGrantTypes).toEqual(['authorization_code', 'refresh_token'])
      expect(client!.requiresPkce).toBe(true)
    })

    it('should load multiple clients from OAUTH2_CLIENT_LIST', () => {
      process.env.OAUTH2_CLIENT_LIST = 'CLIENT_A,CLIENT_B'
      setClientEnv('CLIENT_A', { clientId: 'a-id', allowedUris: 'https://a.com/cb' })
      setClientEnv('CLIENT_B', { clientId: 'b-id', allowedUris: 'https://b.com/cb' })
      expect(service.findClientById('a-id')).toBeDefined()
      expect(service.findClientById('b-id')).toBeDefined()
    })

    it('should merge enum client names with OAUTH2_CLIENT_LIST (deduplication)', () => {
      process.env.OAUTH2_CLIENT_LIST = 'PAAS_MPA,CUSTOM'
      setClientEnv('PAAS_MPA', { clientId: 'paas-id', allowedUris: 'https://paas.com/cb' })
      setClientEnv('DPB', { clientId: 'dpb-id', allowedUris: 'https://dpb.com/cb' })
      setClientEnv('CUSTOM', { clientId: 'custom-id', allowedUris: 'https://custom.com/cb' })
      expect(service.findClientById('paas-id')).toBeDefined()
      expect(service.findClientById('dpb-id')).toBeDefined()
      expect(service.findClientById('custom-id')).toBeDefined()
    })

    it('should skip clients with missing CLIENT_ID', () => {
      setClientEnv('DPB', { clientId: 'dpb-id', allowedUris: 'https://dpb.com/cb' })
      // PAAS_MPA has no CLIENT_ID (from enum, will be attempted)
      expect(service.findClientByName('DPB')).toBeDefined()
      expect(service.findClientByName('PAAS_MPA')).toBeUndefined()
    })

    it('should skip clients with missing ALLOWED_URIS', () => {
      process.env.OAUTH2_PAAS_MPA_CLIENT_ID = 'paas-id'
      setClientEnv('DPB', { clientId: 'dpb-id', allowedUris: 'https://dpb.com/cb' })
      expect(service.findClientById('paas-id')).toBeUndefined()
      expect(service.findClientById('dpb-id')).toBeDefined()
    })

    it('should default requiresPkce to true when REQUIRES_PKCE is not set', () => {
      setClientEnv('PAAS_MPA', { clientId: 'paas-id', allowedUris: 'https://paas.com/cb' })
      expect(service.findClientById('paas-id')!.requiresPkce).toBe(true)
    })

    it('should set requiresPkce to false only when explicitly "false"', () => {
      setClientEnv('PAAS_MPA', {
        clientId: 'paas-id',
        allowedUris: 'https://paas.com/cb',
        requiresPkce: 'false',
      })
      expect(service.findClientById('paas-id')!.requiresPkce).toBe(false)
    })

    it('should default requiresPkce to true when REQUIRES_PKCE is empty string', () => {
      // CUSTOM PROXY DETAIL: `!== 'false'` means empty string is NOT 'false', so defaults to true.
      // The PKCE-by-default policy aligns with RFC 9700 Section 2.1.1; the env-string parsing rule is ours.
      setClientEnv('PAAS_MPA', {
        clientId: 'paas-id',
        allowedUris: 'https://paas.com/cb',
        requiresPkce: '',
      })
      expect(service.findClientById('paas-id')!.requiresPkce).toBe(true)
    })

    it('should handle optional fields being absent', () => {
      setClientEnv('PAAS_MPA', { clientId: 'paas-id', allowedUris: 'https://paas.com/cb' })
      const client = service.findClientById('paas-id')!
      expect(client.secret).toBeUndefined()
      expect(client.allowedScopes).toEqual([])
      expect(client.allowedGrantTypes).toEqual([])
    })

    it('should trim whitespace and filter empty values from comma-separated lists', () => {
      setClientEnv('PAAS_MPA', {
        clientId: 'paas-id',
        allowedUris: ' https://a.com/cb , https://b.com/cb , ',
        allowedScopes: ' openid , , profile ',
      })
      const client = service.findClientById('paas-id')!
      expect(client.allowedRedirectUris).toEqual(['https://a.com/cb', 'https://b.com/cb'])
      expect(client.allowedScopes).toEqual(['openid', 'profile'])
    })
  })

  /**
   * Lazy Loading
   * CUSTOM PROXY DETAIL: Clients loaded from env on first access, then cached for the
   * lifetime of the service instance. Not addressed by any RFC.
   */
  describe('lazy loading', () => {
    it('should load clients on first call and cache for subsequent calls', () => {
      setClientEnv('PAAS_MPA', { clientId: 'paas-id', allowedUris: 'https://paas.com/cb' })
      expect(service.findClientById('paas-id')).toBeDefined()
      process.env.OAUTH2_PAAS_MPA_CLIENT_ID = 'changed-id'
      expect(service.findClientById('paas-id')).toBeDefined()
      expect(service.findClientById('changed-id')).toBeUndefined()
    })
  })

  /**
   * Client Lookup
   * RFC 6749 Section 2.2 - Client identifier is unique to the authorization server
   */
  describe('findClientById', () => {
    it('should find a client by its unique client_id', () => {
      // RFC 6749 Section 2.2: Client identifier is unique to the authorization server
      setClientEnv('PAAS_MPA', { clientId: 'paas-id', allowedUris: 'https://paas.com/cb' })
      const client = service.findClientById('paas-id')
      expect(client).toBeDefined()
      expect(client!.id).toBe('paas-id')
    })

    it('should return undefined for an unregistered client_id', () => {
      // RFC 6749 Section 2.2: Unregistered client identifiers must not resolve
      setClientEnv('PAAS_MPA', { clientId: 'paas-id', allowedUris: 'https://paas.com/cb' })
      expect(service.findClientById('nonexistent')).toBeUndefined()
    })
  })

  describe('findClientByName', () => {
    it('should find a client by its name (env prefix)', () => {
      setClientEnv('DPB', { clientId: 'dpb-id', allowedUris: 'https://dpb.com/cb' })
      const client = service.findClientByName('DPB')
      expect(client).toBeDefined()
      expect(client!.name).toBe('DPB')
    })

    it('should return undefined for an unknown client name', () => {
      setClientEnv('DPB', { clientId: 'dpb-id', allowedUris: 'https://dpb.com/cb' })
      expect(service.findClientByName('NONEXISTENT')).toBeUndefined()
    })
  })
})
