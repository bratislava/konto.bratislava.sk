import { createMock } from '@golevelup/ts-jest'
import { HttpStatus } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { OAuth2AuthorizationErrorCode, OAuth2TokenErrorCode } from '../oauth2.error.enum'
import { OAuth2Exception } from '../oauth2.exception'
import { OAuth2ErrorThrower } from '../oauth2-error.thrower'
import { OAuth2Client, OAuth2ClientSubservice } from './oauth2-client.subservice'
import { OAuth2ValidationSubservice } from './oauth2-validation.subservice'

describe('OAuth2ValidationSubservice', () => {
  let service: OAuth2ValidationSubservice
  let oAuth2ErrorThrower: OAuth2ErrorThrower
  let oAuth2ClientSubservice: OAuth2ClientSubservice

  const mockClient = createMock<OAuth2Client>({
    id: 'test-client-id',
    secret: 'test-secret',
    name: 'TEST',
    requiresPkce: true,
    isRedirectUriAllowed: jest.fn().mockReturnValue(true),
    areAllScopesAllowed: jest.fn().mockReturnValue(true),
  })

  const mockPublicPkceClient = createMock<OAuth2Client>({
    id: 'public-pkce-client-id',
    secret: undefined,
    name: 'PUBLIC_PKCE',
    requiresPkce: true,
    isRedirectUriAllowed: jest.fn().mockReturnValue(true),
    areAllScopesAllowed: jest.fn().mockReturnValue(true),
  })

  const mockConfidentialNoPkceClient = createMock<OAuth2Client>({
    id: 'confidential-no-pkce-client-id',
    secret: 'confidential-secret',
    name: 'CONFIDENTIAL_NO_PKCE',
    requiresPkce: false,
    isRedirectUriAllowed: jest.fn().mockReturnValue(true),
    areAllScopesAllowed: jest.fn().mockReturnValue(true),
  })

  function validAuthParams() {
    return {
      responseType: 'code',
      clientId: 'test-client-id',
      redirectUri: 'https://example.com/callback',
      scope: 'read',
      state: 'csrf-123',
      codeChallenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
      codeChallengeMethod: 'S256',
    }
  }

  function mockRequest(overrides: { headers?: any; body?: any } = {}): any {
    return { headers: overrides.headers ?? {}, body: overrides.body ?? {} }
  }

  function basicAuth(clientId: string, clientSecret: string): string {
    const encoded = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
    return `Basic ${encoded}`
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OAuth2ValidationSubservice,
        { provide: OAuth2ErrorThrower, useValue: createMock<OAuth2ErrorThrower>() },
        { provide: OAuth2ClientSubservice, useValue: createMock<OAuth2ClientSubservice>() },
      ],
    }).compile()

    service = module.get<OAuth2ValidationSubservice>(OAuth2ValidationSubservice)
    oAuth2ErrorThrower = module.get<OAuth2ErrorThrower>(OAuth2ErrorThrower)
    oAuth2ClientSubservice = module.get<OAuth2ClientSubservice>(OAuth2ClientSubservice)

    // Re-set mock return values (cleared by jest.clearAllMocks)
    jest.spyOn(mockClient, 'isRedirectUriAllowed').mockReturnValue(true)
    jest.spyOn(mockClient, 'areAllScopesAllowed').mockReturnValue(true)
    jest.spyOn(mockPublicPkceClient, 'isRedirectUriAllowed').mockReturnValue(true)
    jest.spyOn(mockPublicPkceClient, 'areAllScopesAllowed').mockReturnValue(true)
    jest.spyOn(mockConfidentialNoPkceClient, 'isRedirectUriAllowed').mockReturnValue(true)
    jest.spyOn(mockConfidentialNoPkceClient, 'areAllScopesAllowed').mockReturnValue(true)

    jest
      .spyOn(oAuth2ErrorThrower, 'authorizationException')
      .mockImplementation(
        (errorCode, errorDescription, errorUri, consoleMessage, logMetadata) =>
          new OAuth2Exception(
            { error: errorCode, error_description: errorDescription, error_uri: errorUri },
            HttpStatus.BAD_REQUEST,
            { consoleMessage, metadata: logMetadata }
          )
      )
    jest
      .spyOn(oAuth2ErrorThrower, 'tokenException')
      .mockImplementation(
        (errorCode, errorDescription, errorUri, consoleMessage, logMetadata) =>
          new OAuth2Exception(
            { error: errorCode, error_description: errorDescription, error_uri: errorUri },
            HttpStatus.BAD_REQUEST,
            { consoleMessage, metadata: logMetadata }
          )
      )
    jest.spyOn(oAuth2ClientSubservice, 'findClientById').mockReturnValue(mockClient)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  // ─── validateAuthorizationRequest ─────────────────────────────────────────

  describe('validateAuthorizationRequest', () => {
    /**
     * client_id Validation
     * RFC 6749 Section 4.1.1 - client_id REQUIRED
     * RFC 6749 Section 4.1.2.1 - MUST NOT redirect if client_id invalid
     */
    describe('client_id validation', () => {
      it('should throw INVALID_REQUEST when client_id is missing', () => {
        expect(() => {
          service.validateAuthorizationRequest({ ...validAuthParams(), clientId: undefined })
        }).toThrow(OAuth2Exception)
        expect(oAuth2ErrorThrower.authorizationException).toHaveBeenCalledWith(
          OAuth2AuthorizationErrorCode.INVALID_REQUEST,
          'Invalid request: client_id is required',
          undefined,
          'Missing or invalid client_id in authorization request',
          { hasClientId: false, clientIdType: 'undefined' }
        )
      })

      it('should throw INVALID_REQUEST when client_id is empty string', () => {
        expect(() => {
          service.validateAuthorizationRequest({ ...validAuthParams(), clientId: '' })
        }).toThrow(OAuth2Exception)
        expect(oAuth2ErrorThrower.authorizationException).toHaveBeenCalledWith(
          OAuth2AuthorizationErrorCode.INVALID_REQUEST,
          'Invalid request: client_id is required',
          undefined,
          'Missing or invalid client_id in authorization request',
          { hasClientId: false, clientIdType: 'string' }
        )
      })

      it('should throw INVALID_REQUEST when client_id is not a string', () => {
        expect(() => {
          service.validateAuthorizationRequest({ ...validAuthParams(), clientId: 12345 })
        }).toThrow(OAuth2Exception)
        expect(oAuth2ErrorThrower.authorizationException).toHaveBeenCalledWith(
          OAuth2AuthorizationErrorCode.INVALID_REQUEST,
          'Invalid request: client_id is required',
          undefined,
          'Missing or invalid client_id in authorization request',
          { hasClientId: true, clientIdType: 'number' }
        )
      })

      it('should throw UNAUTHORIZED_CLIENT when client_id is not registered', () => {
        jest.spyOn(oAuth2ClientSubservice, 'findClientById').mockReturnValue(undefined)
        expect(() => {
          service.validateAuthorizationRequest(validAuthParams())
        }).toThrow(OAuth2Exception)
        expect(oAuth2ErrorThrower.authorizationException).toHaveBeenCalledWith(
          OAuth2AuthorizationErrorCode.UNAUTHORIZED_CLIENT,
          'Unauthorized client: unknown client',
          undefined,
          'Client not found',
          { clientId: 'test-client-id' }
        )
      })
    })

    /**
     * redirect_uri Validation
     * RFC 6749 Section 3.1.2.3 - Must match registered URI
     * RFC 6819 Section 5.2.3.5 - Prevent open redirector
     */
    describe('redirect_uri validation', () => {
      it('should throw INVALID_REQUEST when redirect_uri is missing', () => {
        expect(() => {
          service.validateAuthorizationRequest({ ...validAuthParams(), redirectUri: undefined })
        }).toThrow(OAuth2Exception)
        expect(oAuth2ErrorThrower.authorizationException).toHaveBeenCalledWith(
          OAuth2AuthorizationErrorCode.INVALID_REQUEST,
          'Invalid request: redirect_uri is required',
          undefined,
          'Missing or invalid redirect_uri in authorization request',
          { clientId: 'test-client-id', hasRedirectUri: false, redirectUriType: 'undefined' }
        )
      })

      it('should throw INVALID_REQUEST when redirect_uri is empty string', () => {
        expect(() => {
          service.validateAuthorizationRequest({ ...validAuthParams(), redirectUri: '' })
        }).toThrow(OAuth2Exception)
        expect(oAuth2ErrorThrower.authorizationException).toHaveBeenCalledWith(
          OAuth2AuthorizationErrorCode.INVALID_REQUEST,
          'Invalid request: redirect_uri is required',
          undefined,
          'Missing or invalid redirect_uri in authorization request',
          { clientId: 'test-client-id', hasRedirectUri: false, redirectUriType: 'string' }
        )
      })

      it('should throw INVALID_REQUEST when redirect_uri is not in client allowlist', () => {
        jest.spyOn(mockClient, 'isRedirectUriAllowed').mockReturnValue(false)
        expect(() => {
          service.validateAuthorizationRequest({
            ...validAuthParams(),
            redirectUri: 'https://malicious.com/cb',
          })
        }).toThrow(OAuth2Exception)
        expect(oAuth2ErrorThrower.authorizationException).toHaveBeenCalledWith(
          OAuth2AuthorizationErrorCode.INVALID_REQUEST,
          'Invalid request: provided redirect URI is not allowed for this client',
          undefined,
          'Redirect URI not allowed for client',
          { clientId: 'test-client-id', redirectUri: 'https://malicious.com/cb' }
        )
      })
    })

    /**
     * scope Validation
     * RFC 6749 Section 3.3 - Space-delimited, case-sensitive strings
     * RFC 6749 Section 4.1.2.1 - invalid_scope error code
     */
    describe('scope validation', () => {
      it('should accept undefined scope (optional per RFC 6749 Section 4.1.1)', () => {
        expect(() => {
          service.validateAuthorizationRequest({ ...validAuthParams(), scope: undefined })
        }).not.toThrow()
      })

      it('should throw INVALID_SCOPE when scope is not a string', () => {
        expect(() => {
          service.validateAuthorizationRequest({ ...validAuthParams(), scope: 123 })
        }).toThrow(OAuth2Exception)
        expect(oAuth2ErrorThrower.authorizationException).toHaveBeenCalledWith(
          OAuth2AuthorizationErrorCode.INVALID_SCOPE,
          'Invalid scope: requested scope is invalid, unknown, or malformed',
          undefined,
          'Invalid scope requested',
          { clientId: 'test-client-id', requestedScope: 123 }
        )
      })

      it('should throw INVALID_SCOPE when scopes are not allowed for client', () => {
        jest.spyOn(mockClient, 'areAllScopesAllowed').mockReturnValue(false)
        expect(() => {
          service.validateAuthorizationRequest({ ...validAuthParams(), scope: 'admin' })
        }).toThrow(OAuth2Exception)
        expect(oAuth2ErrorThrower.authorizationException).toHaveBeenCalledWith(
          OAuth2AuthorizationErrorCode.INVALID_SCOPE,
          'Invalid scope: requested scope is invalid, unknown, or malformed',
          undefined,
          'Invalid scope requested',
          { clientId: 'test-client-id', requestedScope: 'admin' }
        )
      })
    })

    /**
     * PKCE Parameter Validation
     * RFC 7636 Section 4.3 - code_challenge and code_challenge_method
     * RFC 7636 Section 4.4.1 - MUST return invalid_request if PKCE required but missing
     */
    describe('PKCE parameter validation', () => {
      it('should throw INVALID_REQUEST when PKCE-required client does not provide PKCE parameters', () => {
        expect(() => {
          service.validateAuthorizationRequest({
            ...validAuthParams(),
            codeChallenge: undefined,
            codeChallengeMethod: undefined,
          })
        }).toThrow(OAuth2Exception)
        expect(oAuth2ErrorThrower.authorizationException).toHaveBeenCalledWith(
          OAuth2AuthorizationErrorCode.INVALID_REQUEST,
          'Invalid request: PKCE is required for this client: code_challenge and code_challenge_method are required',
          undefined,
          'PKCE required but not provided',
          { clientId: 'test-client-id', hasCodeChallenge: false, hasCodeChallengeMethod: false }
        )
      })

      it('should accept when both code_challenge and code_challenge_method are absent (PKCE not required)', () => {
        jest
          .spyOn(oAuth2ClientSubservice, 'findClientById')
          .mockReturnValue(mockConfidentialNoPkceClient)
        expect(() => {
          service.validateAuthorizationRequest({
            ...validAuthParams(),
            clientId: 'confidential-no-pkce-client-id',
            codeChallenge: undefined,
            codeChallengeMethod: undefined,
          })
        }).not.toThrow()
      })

      it('should throw INVALID_REQUEST when code_challenge is present but code_challenge_method is missing', () => {
        // RFC 7636 Section 4.4.1: MUST return invalid_request if PKCE parameters are incomplete
        jest
          .spyOn(oAuth2ClientSubservice, 'findClientById')
          .mockReturnValue(mockConfidentialNoPkceClient)
        expect(() => {
          service.validateAuthorizationRequest({
            ...validAuthParams(),
            clientId: 'confidential-no-pkce-client-id',
            codeChallenge: 'challenge',
            codeChallengeMethod: undefined,
          })
        }).toThrow(OAuth2Exception)
        expect(oAuth2ErrorThrower.authorizationException).toHaveBeenCalledWith(
          OAuth2AuthorizationErrorCode.INVALID_REQUEST,
          'Invalid request: both code_challenge and code_challenge_method must be provided when using PKCE',
          undefined,
          'PKCE parameters incomplete',
          {
            clientId: 'confidential-no-pkce-client-id',
            hasCodeChallenge: true,
            hasCodeChallengeMethod: false,
          }
        )
      })

      it('should throw INVALID_REQUEST when code_challenge_method is present but code_challenge is missing', () => {
        // RFC 7636 Section 4.4.1: MUST return invalid_request if PKCE parameters are incomplete
        jest
          .spyOn(oAuth2ClientSubservice, 'findClientById')
          .mockReturnValue(mockConfidentialNoPkceClient)
        expect(() => {
          service.validateAuthorizationRequest({
            ...validAuthParams(),
            clientId: 'confidential-no-pkce-client-id',
            codeChallenge: undefined,
            codeChallengeMethod: 'S256',
          })
        }).toThrow(OAuth2Exception)
        expect(oAuth2ErrorThrower.authorizationException).toHaveBeenCalledWith(
          OAuth2AuthorizationErrorCode.INVALID_REQUEST,
          'Invalid request: both code_challenge and code_challenge_method must be provided when using PKCE',
          undefined,
          'PKCE parameters incomplete',
          {
            clientId: 'confidential-no-pkce-client-id',
            hasCodeChallenge: false,
            hasCodeChallengeMethod: true,
          }
        )
      })

      it('should throw INVALID_REQUEST when code_challenge is empty string', () => {
        // RFC 7636 Section 4.3: code_challenge REQUIRED — empty string is not a valid challenge
        jest
          .spyOn(oAuth2ClientSubservice, 'findClientById')
          .mockReturnValue(mockConfidentialNoPkceClient)
        expect(() => {
          service.validateAuthorizationRequest({
            ...validAuthParams(),
            clientId: 'confidential-no-pkce-client-id',
            codeChallenge: '',
            codeChallengeMethod: 'S256',
          })
        }).toThrow(OAuth2Exception)
        expect(oAuth2ErrorThrower.authorizationException).toHaveBeenCalledWith(
          OAuth2AuthorizationErrorCode.INVALID_REQUEST,
          'Invalid request: both code_challenge and code_challenge_method must be provided when using PKCE',
          undefined,
          'PKCE parameters incomplete',
          {
            clientId: 'confidential-no-pkce-client-id',
            hasCodeChallenge: false,
            hasCodeChallengeMethod: true,
          }
        )
      })

      it('should throw INVALID_REQUEST when code_challenge_method is empty string', () => {
        // RFC 7636 Section 4.3: code_challenge_method must be a non-empty value ("S256" or "plain")
        jest
          .spyOn(oAuth2ClientSubservice, 'findClientById')
          .mockReturnValue(mockConfidentialNoPkceClient)
        expect(() => {
          service.validateAuthorizationRequest({
            ...validAuthParams(),
            clientId: 'confidential-no-pkce-client-id',
            codeChallenge: 'challenge',
            codeChallengeMethod: '',
          })
        }).toThrow(OAuth2Exception)
        expect(oAuth2ErrorThrower.authorizationException).toHaveBeenCalledWith(
          OAuth2AuthorizationErrorCode.INVALID_REQUEST,
          'Invalid request: both code_challenge and code_challenge_method must be provided when using PKCE',
          undefined,
          'PKCE parameters incomplete',
          {
            clientId: 'confidential-no-pkce-client-id',
            hasCodeChallenge: true,
            hasCodeChallengeMethod: false,
          }
        )
      })
    })

    /**
     * response_type Validation
     * RFC 6749 Section 3.1.1 - MUST return error if missing or not understood
     * RFC 6749 Section 4.1.2.1 - unsupported_response_type error code
     * RFC 7636 Section 4.4.1 - PKCE clients must use response_type="code"
     */
    describe('response_type validation', () => {
      it('should throw INVALID_REQUEST when response_type is missing', () => {
        expect(() => {
          service.validateAuthorizationRequest({ ...validAuthParams(), responseType: undefined })
        }).toThrow(OAuth2Exception)
        expect(oAuth2ErrorThrower.authorizationException).toHaveBeenCalledWith(
          OAuth2AuthorizationErrorCode.INVALID_REQUEST,
          'Invalid request: string response_type is required',
          undefined,
          'Missing or invalid response_type in authorization request',
          { clientId: 'test-client-id', hasResponseType: false, responseTypeValue: undefined }
        )
      })

      it('should throw INVALID_REQUEST when response_type is not a string', () => {
        expect(() => {
          service.validateAuthorizationRequest({ ...validAuthParams(), responseType: 42 })
        }).toThrow(OAuth2Exception)
        expect(oAuth2ErrorThrower.authorizationException).toHaveBeenCalledWith(
          OAuth2AuthorizationErrorCode.INVALID_REQUEST,
          'Invalid request: string response_type is required',
          undefined,
          'Missing or invalid response_type in authorization request',
          { clientId: 'test-client-id', hasResponseType: true, responseTypeValue: 42 }
        )
      })

      it('should throw UNSUPPORTED_RESPONSE_TYPE for unknown response_type values', () => {
        expect(() => {
          service.validateAuthorizationRequest({ ...validAuthParams(), responseType: 'unknown' })
        }).toThrow(OAuth2Exception)
        expect(oAuth2ErrorThrower.authorizationException).toHaveBeenCalledWith(
          OAuth2AuthorizationErrorCode.UNSUPPORTED_RESPONSE_TYPE,
          'Unsupported response_type: unknown - must be "code" (implicit grant - "token" - not supported)',
          undefined,
          'Unsupported response_type',
          { clientId: 'test-client-id', responseType: 'unknown' }
        )
      })

      it('should throw UNSUPPORTED_RESPONSE_TYPE for "token" (implicit grant) on a PKCE client', () => {
        // RFC 9700 Section 2.1.2: the implicit grant ("token" response type) must not be used
        expect(() => {
          service.validateAuthorizationRequest({ ...validAuthParams(), responseType: 'token' })
        }).toThrow(OAuth2Exception)
        expect(oAuth2ErrorThrower.authorizationException).toHaveBeenCalledWith(
          OAuth2AuthorizationErrorCode.UNSUPPORTED_RESPONSE_TYPE,
          'Unsupported response_type: "token" - implicit grant not supported (use "code" instead)'
        )
      })

      it('should throw UNSUPPORTED_RESPONSE_TYPE for "token" (implicit grant) on a non-PKCE client', () => {
        jest
          .spyOn(oAuth2ClientSubservice, 'findClientById')
          .mockReturnValue(mockConfidentialNoPkceClient)
        expect(() => {
          service.validateAuthorizationRequest({
            ...validAuthParams(),
            clientId: 'confidential-no-pkce-client-id',
            responseType: 'token',
            codeChallenge: undefined,
            codeChallengeMethod: undefined,
          })
        }).toThrow(OAuth2Exception)
        expect(oAuth2ErrorThrower.authorizationException).toHaveBeenCalledWith(
          OAuth2AuthorizationErrorCode.UNSUPPORTED_RESPONSE_TYPE,
          'Unsupported response_type: "token" - implicit grant not supported (use "code" instead)'
        )
      })
    })

    /**
     * Full Valid Request
     * RFC 6749 Section 4.1.1 - Full validation pipeline
     */
    describe('full valid request', () => {
      it('should not throw for a complete valid authorization request', () => {
        expect(() => {
          service.validateAuthorizationRequest(validAuthParams())
        }).not.toThrow()
        expect(oAuth2ClientSubservice.findClientById).toHaveBeenCalledWith('test-client-id')
        expect(mockClient.isRedirectUriAllowed).toHaveBeenCalledWith('https://example.com/callback')
        expect(mockClient.areAllScopesAllowed).toHaveBeenCalledWith('read')
      })

      it('should not throw for a minimal valid request (non-PKCE client)', () => {
        jest
          .spyOn(oAuth2ClientSubservice, 'findClientById')
          .mockReturnValue(mockConfidentialNoPkceClient)
        expect(() => {
          service.validateAuthorizationRequest({
            responseType: 'code',
            clientId: 'confidential-no-pkce-client-id',
            redirectUri: 'https://example.com/callback',
            scope: undefined,
            state: undefined,
            codeChallenge: undefined,
            codeChallengeMethod: undefined,
          })
        }).not.toThrow()
      })
    })
  })

  // ─── extractClientCredentials ─────────────────────────────────────────────

  /**
   * RFC 6749 Section 2.3.1 - HTTP Basic Auth or request body credentials
   * RFC 6749 Section 2.3 - Client MUST NOT use more than one auth method
   */
  describe('extractClientCredentials', () => {
    describe('HTTP Basic Authentication', () => {
      it('should extract client_id and client_secret from Basic Auth header', () => {
        const result = service.extractClientCredentials(
          mockRequest({ headers: { authorization: basicAuth('my-client', 'my-secret') } })
        )
        expect(result).toEqual({ clientId: 'my-client', clientSecret: 'my-secret' })
      })

      it('should handle client_secret containing colons (split on first colon)', () => {
        // RFC 6749 Section 2.3.1: HTTP Basic Auth format is client_id:client_secret per RFC 2617
        const result = service.extractClientCredentials(
          mockRequest({ headers: { authorization: basicAuth('my-client', 'secret:with:colons') } })
        )
        expect(result).toEqual({ clientId: 'my-client', clientSecret: 'secret:with:colons' })
      })

      it('should fall through to body when Basic Auth has no colon', () => {
        const malformed = Buffer.from('nocolon').toString('base64')
        const result = service.extractClientCredentials(
          mockRequest({
            headers: { authorization: `Basic ${malformed}` },
            body: { client_id: 'body-client', client_secret: 'body-secret' },
          })
        )
        expect(result).toEqual({ clientId: 'body-client', clientSecret: 'body-secret' })
      })

      it('should fall through to body when Basic Auth has empty client_id (colon at position 0)', () => {
        const emptyId = Buffer.from(':secret').toString('base64')
        const result = service.extractClientCredentials(
          mockRequest({
            headers: { authorization: `Basic ${emptyId}` },
            body: { client_id: 'body-client', client_secret: 'body-secret' },
          })
        )
        expect(result).toEqual({ clientId: 'body-client', clientSecret: 'body-secret' })
      })

      it('should fall through to body when base64 is invalid', () => {
        const result = service.extractClientCredentials(
          mockRequest({
            headers: { authorization: 'Basic !!!invalid!!!' },
            body: { client_id: 'body-client', client_secret: 'body-secret' },
          })
        )
        expect(result.clientId).toBe('body-client')
      })

      it('should ignore non-Basic Authorization headers (e.g. Bearer)', () => {
        const result = service.extractClientCredentials(
          mockRequest({
            headers: { authorization: 'Bearer some-jwt' },
            body: { client_id: 'body-client', client_secret: 'body-secret' },
          })
        )
        expect(result).toEqual({ clientId: 'body-client', clientSecret: 'body-secret' })
      })
    })

    describe('Request Body Credentials', () => {
      it('should extract client_id and client_secret from request body', () => {
        const result = service.extractClientCredentials(
          mockRequest({ body: { client_id: 'body-client', client_secret: 'body-secret' } })
        )
        expect(result).toEqual({ clientId: 'body-client', clientSecret: 'body-secret' })
      })

      it('should ignore empty string client_id in body', () => {
        const result = service.extractClientCredentials(
          mockRequest({ body: { client_id: '', client_secret: 'secret' } })
        )
        expect(result.clientId).toBeUndefined()
      })

      it('should ignore non-string client_id in body', () => {
        const result = service.extractClientCredentials(mockRequest({ body: { client_id: 12345 } }))
        expect(result.clientId).toBeUndefined()
      })
    })

    describe('Precedence', () => {
      it('should prefer Basic Auth over body credentials', () => {
        const result = service.extractClientCredentials(
          mockRequest({
            headers: { authorization: basicAuth('header-client', 'header-secret') },
            body: { client_id: 'body-client', client_secret: 'body-secret' },
          })
        )
        expect(result).toEqual({ clientId: 'header-client', clientSecret: 'header-secret' })
      })

      it('should fall back to body when Basic Auth is malformed', () => {
        const malformed = Buffer.from('nocolon').toString('base64')
        const result = service.extractClientCredentials(
          mockRequest({
            headers: { authorization: `Basic ${malformed}` },
            body: { client_id: 'fallback', client_secret: 'fallback-s' },
          })
        )
        expect(result).toEqual({ clientId: 'fallback', clientSecret: 'fallback-s' })
      })
    })

    describe('No credentials', () => {
      it('should return undefined for both when no credentials provided', () => {
        expect(service.extractClientCredentials(mockRequest())).toEqual({
          clientId: undefined,
          clientSecret: undefined,
        })
      })
    })
  })

  // ─── isValidSecret ────────────────────────────────────────────────────────

  /**
   * Timing-safe secret comparison (OWASP recommendation)
   * Prevents timing attacks on client secret validation
   */
  describe('isValidSecret', () => {
    it('should return true for matching secrets', () => {
      expect(service.isValidSecret('secret-123', 'secret-123')).toBe(true)
    })
    it('should return false for same-length mismatch', () => {
      expect(service.isValidSecret('secret-aaa', 'secret-bbb')).toBe(false)
    })
    it('should return false for different-length mismatch', () => {
      expect(service.isValidSecret('short', 'much-longer')).toBe(false)
    })
    it('should return false for empty vs non-empty', () => {
      expect(service.isValidSecret('expected', '')).toBe(false)
    })
    it('should return true for both empty', () => {
      expect(service.isValidSecret('', '')).toBe(true)
    })
  })

  // ─── validateTokenRequest ─────────────────────────────────────────────────

  describe('validateTokenRequest', () => {
    /**
     * Grant Type Routing
     * RFC 6749 Section 4.1.3 - authorization_code
     * RFC 6749 Section 6 - refresh_token
     * RFC 6749 Section 5.2 - unsupported_grant_type
     */
    describe('grant_type routing', () => {
      it('should accept authorization_code grant type', () => {
        expect(() => {
          service.validateTokenRequest({
            clientId: 'test-client-id',
            clientSecret: 'test-secret',
            grantType: 'authorization_code',
            codeVerifier: 'verifier',
          })
        }).not.toThrow()
      })

      it('should accept refresh_token grant type', () => {
        expect(() => {
          service.validateTokenRequest({
            clientId: 'test-client-id',
            clientSecret: 'test-secret',
            grantType: 'refresh_token',
          })
        }).not.toThrow()
      })

      it('should throw UNSUPPORTED_GRANT_TYPE for unknown grant type', () => {
        expect(() => {
          service.validateTokenRequest({
            clientId: 'test-client-id',
            clientSecret: 'test-secret',
            grantType: 'client_credentials',
          })
        }).toThrow(OAuth2Exception)
        expect(oAuth2ErrorThrower.tokenException).toHaveBeenCalledWith(
          OAuth2TokenErrorCode.UNSUPPORTED_GRANT_TYPE,
          'Unsupported grant type: client_credentials',
          undefined,
          'Unsupported grant type',
          { grantType: 'client_credentials' }
        )
      })

      it('should throw UNSUPPORTED_GRANT_TYPE when grant_type is undefined', () => {
        expect(() => {
          service.validateTokenRequest({
            clientId: 'test-client-id',
            clientSecret: 'test-secret',
            grantType: undefined,
          })
        }).toThrow(OAuth2Exception)
        expect(oAuth2ErrorThrower.tokenException).toHaveBeenCalledWith(
          OAuth2TokenErrorCode.UNSUPPORTED_GRANT_TYPE,
          'Unsupported grant type: undefined',
          undefined,
          'Unsupported grant type',
          { grantType: undefined }
        )
      })

      it('should clear redirectUri and codeVerifier for refresh_token grant', () => {
        jest.spyOn(mockClient, 'isRedirectUriAllowed').mockReturnValue(false)
        // Invalid redirect_uri with refresh_token should NOT throw (it's cleared)
        expect(() => {
          service.validateTokenRequest({
            clientId: 'test-client-id',
            clientSecret: 'test-secret',
            grantType: 'refresh_token',
            redirectUri: 'https://malicious.com/cb',
            codeVerifier: undefined,
          })
        }).not.toThrow()
        expect(mockClient.isRedirectUriAllowed).not.toHaveBeenCalled()
      })
    })

    /**
     * Client Authentication
     * RFC 6749 Section 2.3 - Client authentication
     * RFC 6749 Section 5.2 - invalid_client error
     */
    describe('client authentication', () => {
      it('should throw INVALID_CLIENT when client_id is missing', () => {
        expect(() => {
          service.validateTokenRequest({ clientId: undefined, grantType: 'authorization_code' })
        }).toThrow(OAuth2Exception)
        expect(oAuth2ErrorThrower.tokenException).toHaveBeenCalledWith(
          OAuth2TokenErrorCode.INVALID_CLIENT,
          'Invalid request: client_id is required',
          undefined,
          'Missing client_id in token request',
          { grantType: 'authorization_code', hasClientSecret: false }
        )
      })

      it('should throw INVALID_CLIENT when client_id is not registered', () => {
        jest.spyOn(oAuth2ClientSubservice, 'findClientById').mockReturnValue(undefined)
        expect(() => {
          service.validateTokenRequest({ clientId: 'nonexistent', grantType: 'authorization_code' })
        }).toThrow(OAuth2Exception)
        expect(oAuth2ErrorThrower.tokenException).toHaveBeenCalledWith(
          OAuth2TokenErrorCode.INVALID_CLIENT,
          'Unauthorized client: unknown client',
          undefined,
          'Client not found for token request',
          { clientId: 'nonexistent', grantType: 'authorization_code' }
        )
      })

      it('should throw INVALID_CLIENT when secret required but not provided', () => {
        expect(() => {
          service.validateTokenRequest({
            clientId: 'test-client-id',
            clientSecret: undefined,
            grantType: 'authorization_code',
            codeVerifier: 'v',
          })
        }).toThrow(OAuth2Exception)
        expect(oAuth2ErrorThrower.tokenException).toHaveBeenCalledWith(
          OAuth2TokenErrorCode.INVALID_CLIENT,
          'Invalid client: client_secret is required',
          undefined,
          'Client secret required but not provided',
          { clientId: 'test-client-id', grantType: 'authorization_code' }
        )
      })

      it('should throw INVALID_CLIENT when client_secret does not match', () => {
        expect(() => {
          service.validateTokenRequest({
            clientId: 'test-client-id',
            clientSecret: 'wrong-secret',
            grantType: 'authorization_code',
            codeVerifier: 'v',
          })
        }).toThrow(OAuth2Exception)
        expect(oAuth2ErrorThrower.tokenException).toHaveBeenCalledWith(
          OAuth2TokenErrorCode.INVALID_CLIENT,
          'Invalid client: invalid client_secret',
          undefined,
          'Invalid client secret provided',
          { clientId: 'test-client-id', grantType: 'authorization_code', hasClientSecret: true }
        )
      })

      it('should accept when client has no secret (public client)', () => {
        // Public clients carry no secret, so the secret check is skipped — but they MUST use PKCE,
        // so a code_verifier is supplied here.
        jest.spyOn(oAuth2ClientSubservice, 'findClientById').mockReturnValue(mockPublicPkceClient)
        expect(() => {
          service.validateTokenRequest({
            clientId: 'public-pkce-client-id',
            clientSecret: undefined,
            grantType: 'authorization_code',
            codeVerifier: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
          })
        }).not.toThrow()
      })

      it('should accept when client_secret matches', () => {
        expect(() => {
          service.validateTokenRequest({
            clientId: 'test-client-id',
            clientSecret: 'test-secret',
            grantType: 'authorization_code',
            codeVerifier: 'v',
          })
        }).not.toThrow()
      })

      it('should skip secret validation when client.secret is empty string (falsy)', () => {
        // CUSTOM PROXY DETAIL: The `if (client.secret)` check treats empty string same as undefined.
        // A client with secret='' is effectively a public client. RFC 6749 Section 2.1 distinguishes
        // public vs confidential clients, but doesn't dictate how the registry encodes "no secret".
        const emptySecretClient = createMock<OAuth2Client>({
          id: 'empty-secret-client',
          secret: '',
          name: 'EMPTY',
          requiresPkce: false,
          isRedirectUriAllowed: jest.fn().mockReturnValue(true),
          areAllScopesAllowed: jest.fn().mockReturnValue(true),
        })
        jest.spyOn(oAuth2ClientSubservice, 'findClientById').mockReturnValue(emptySecretClient)
        expect(() => {
          service.validateTokenRequest({
            clientId: 'empty-secret-client',
            clientSecret: undefined,
            grantType: 'authorization_code',
          })
        }).not.toThrow()
      })
    })

    /**
     * redirect_uri Validation at Token Endpoint
     * RFC 6749 Section 4.1.3 - redirect_uri must match if included
     * RFC 6819 Section 5.2.4.5 - Binding of code to redirect_uri
     */
    describe('redirect_uri validation', () => {
      it('should throw INVALID_REQUEST when redirect_uri not in allowlist', () => {
        jest.spyOn(mockClient, 'isRedirectUriAllowed').mockReturnValue(false)
        expect(() => {
          service.validateTokenRequest({
            clientId: 'test-client-id',
            clientSecret: 'test-secret',
            redirectUri: 'https://malicious.com/cb',
            grantType: 'authorization_code',
            codeVerifier: 'v',
          })
        }).toThrow(OAuth2Exception)
        expect(oAuth2ErrorThrower.tokenException).toHaveBeenCalledWith(
          OAuth2TokenErrorCode.INVALID_REQUEST,
          'Invalid request: provided redirect URI is not allowed for this client',
          undefined,
          'Redirect URI not allowed for client in token request',
          {
            clientId: 'test-client-id',
            redirectUri: 'https://malicious.com/cb',
            grantType: 'authorization_code',
          }
        )
      })

      it('should skip redirect_uri validation when not provided', () => {
        expect(() => {
          service.validateTokenRequest({
            clientId: 'test-client-id',
            clientSecret: 'test-secret',
            redirectUri: undefined,
            grantType: 'authorization_code',
            codeVerifier: 'v',
          })
        }).not.toThrow()
        expect(mockClient.isRedirectUriAllowed).not.toHaveBeenCalled()
      })

      it('should skip redirect_uri validation when not a string', () => {
        expect(() => {
          service.validateTokenRequest({
            clientId: 'test-client-id',
            clientSecret: 'test-secret',
            redirectUri: 12345 as any,
            grantType: 'authorization_code',
            codeVerifier: 'v',
          })
        }).not.toThrow()
        expect(mockClient.isRedirectUriAllowed).not.toHaveBeenCalled()
      })
    })

    /**
     * PKCE code_verifier Requirement
     * RFC 7636 Section 4.5 - code_verifier REQUIRED at token endpoint
     */
    describe('PKCE code_verifier requirement', () => {
      it('should throw INVALID_REQUEST when PKCE client omits code_verifier for authorization_code', () => {
        expect(() => {
          service.validateTokenRequest({
            clientId: 'test-client-id',
            clientSecret: 'test-secret',
            grantType: 'authorization_code',
            codeVerifier: undefined,
          })
        }).toThrow(OAuth2Exception)
        expect(oAuth2ErrorThrower.tokenException).toHaveBeenCalledWith(
          OAuth2TokenErrorCode.INVALID_REQUEST,
          'Invalid request: PKCE code_verifier is required',
          undefined,
          'PKCE code_verifier required but not provided',
          { clientId: 'test-client-id', grantType: 'authorization_code', hasCodeVerifier: false }
        )
      })

      it('should throw INVALID_REQUEST when code_verifier is empty string', () => {
        expect(() => {
          service.validateTokenRequest({
            clientId: 'test-client-id',
            clientSecret: 'test-secret',
            grantType: 'authorization_code',
            codeVerifier: '',
          })
        }).toThrow(OAuth2Exception)
        expect(oAuth2ErrorThrower.tokenException).toHaveBeenCalledWith(
          OAuth2TokenErrorCode.INVALID_REQUEST,
          'Invalid request: PKCE code_verifier is required',
          undefined,
          'PKCE code_verifier required but not provided',
          { clientId: 'test-client-id', grantType: 'authorization_code', hasCodeVerifier: false }
        )
      })

      it('should accept when code_verifier is provided', () => {
        expect(() => {
          service.validateTokenRequest({
            clientId: 'test-client-id',
            clientSecret: 'test-secret',
            grantType: 'authorization_code',
            codeVerifier: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
          })
        }).not.toThrow()
      })

      it('should not require code_verifier when client does not require PKCE', () => {
        jest
          .spyOn(oAuth2ClientSubservice, 'findClientById')
          .mockReturnValue(mockConfidentialNoPkceClient)
        expect(() => {
          service.validateTokenRequest({
            clientId: 'confidential-no-pkce-client-id',
            clientSecret: 'confidential-secret',
            grantType: 'authorization_code',
            codeVerifier: undefined,
          })
        }).not.toThrow()
      })

      it('should not require code_verifier for refresh_token grant', () => {
        expect(() => {
          service.validateTokenRequest({
            clientId: 'test-client-id',
            clientSecret: 'test-secret',
            grantType: 'refresh_token',
            codeVerifier: undefined,
          })
        }).not.toThrow()
      })
    })
  })
})
