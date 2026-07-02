import { createMock } from '@golevelup/ts-jest'
import { ExecutionContext, HttpStatus } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { OAuth2TokenErrorCode } from '../oauth2.error.enum'
import { OAuth2Exception } from '../oauth2.exception'
import { OAuth2ValidationSubservice } from '../subservices/oauth2-validation.subservice'
import { RequestWithClientCredentials, TokenRequestGuard } from './token-request.guard'

describe('TokenRequestGuard', () => {
  let guard: TokenRequestGuard
  let validationSubservice: OAuth2ValidationSubservice

  function createMockContext(
    overrides: { body?: any; query?: any; headers?: any } = {}
  ): ExecutionContext {
    const mockRequest: Partial<RequestWithClientCredentials> = {
      body: overrides.body ?? {},
      query: overrides.query ?? {},
      headers: overrides.headers ?? {},
    }
    return {
      switchToHttp: jest.fn().mockReturnValue({ getRequest: () => mockRequest }),
    } as any
  }

  function getRequest(context: ExecutionContext): RequestWithClientCredentials {
    return context.switchToHttp().getRequest()
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenRequestGuard,
        { provide: OAuth2ValidationSubservice, useValue: createMock<OAuth2ValidationSubservice>() },
      ],
    }).compile()

    guard = module.get<TokenRequestGuard>(TokenRequestGuard)
    validationSubservice = module.get<OAuth2ValidationSubservice>(OAuth2ValidationSubservice)

    jest.spyOn(validationSubservice, 'extractClientCredentials').mockReturnValue({
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
    })
  })

  it('should be defined', () => {
    expect(guard).toBeDefined()
  })

  /**
   * Client Credential Extraction
   *
   * RFC 6749 Section 2.3.1 - HTTP Basic Auth or request body credentials
   */
  describe('canActivate - client credential extraction', () => {
    it('should delegate credential extraction to extractClientCredentials()', () => {
      const context = createMockContext({ body: { grant_type: 'authorization_code' } })
      guard.canActivate(context)
      expect(validationSubservice.extractClientCredentials).toHaveBeenCalledTimes(1)
      expect(validationSubservice.extractClientCredentials).toHaveBeenCalledWith(
        getRequest(context)
      )
    })
  })

  /**
   * Token Request Validation Delegation
   *
   * RFC 6749 Section 4.1.3 - authorization_code grant params
   * RFC 7636 Section 4.5 - code_verifier
   * RFC 6749 Section 6 - refresh_token grant params
   */
  describe('canActivate - token request validation delegation', () => {
    it('should pass authorization_code grant params to validateTokenRequest()', () => {
      const context = createMockContext({
        body: {
          grant_type: 'authorization_code',
          redirect_uri: 'https://example.com/cb',
          code_verifier: 'verifier-xyz',
        },
      })
      guard.canActivate(context)
      expect(validationSubservice.validateTokenRequest).toHaveBeenCalledWith({
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        redirectUri: 'https://example.com/cb',
        grantType: 'authorization_code',
        codeVerifier: 'verifier-xyz',
      })
    })

    it('should pass refresh_token grant params to validateTokenRequest()', () => {
      const context = createMockContext({ body: { grant_type: 'refresh_token' } })
      guard.canActivate(context)
      expect(validationSubservice.validateTokenRequest).toHaveBeenCalledWith({
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        redirectUri: undefined,
        grantType: 'refresh_token',
        codeVerifier: undefined,
      })
    })

    it('should read redirect_uri from body', () => {
      // RFC 6749 Section 4.1.3: Token request parameters sent in request body
      const context = createMockContext({
        body: { grant_type: 'authorization_code', redirect_uri: 'https://example.com/cb' },
      })
      guard.canActivate(context)
      expect(validationSubservice.validateTokenRequest).toHaveBeenCalledWith(
        expect.objectContaining({ redirectUri: 'https://example.com/cb' })
      )
    })

    it('should fall back to query for redirect_uri when not in body', () => {
      const context = createMockContext({
        body: { grant_type: 'authorization_code' },
        query: { redirect_uri: 'https://example.com/query-cb' },
      })
      guard.canActivate(context)
      expect(validationSubservice.validateTokenRequest).toHaveBeenCalledWith(
        expect.objectContaining({ redirectUri: 'https://example.com/query-cb' })
      )
    })

    it('should call validateTokenRequest() exactly once', () => {
      const context = createMockContext({ body: { grant_type: 'authorization_code' } })
      guard.canActivate(context)
      expect(validationSubservice.validateTokenRequest).toHaveBeenCalledTimes(1)
    })
  })

  /**
   * Validation Error Propagation
   *
   * RFC 6749 Section 5.2 - Token endpoint errors propagate unmodified
   */
  describe('canActivate - validation error propagation', () => {
    it('should propagate INVALID_CLIENT errors unmodified', () => {
      const error = new OAuth2Exception(
        { error: OAuth2TokenErrorCode.INVALID_CLIENT, error_description: 'unknown' },
        HttpStatus.BAD_REQUEST
      )
      jest.spyOn(validationSubservice, 'validateTokenRequest').mockImplementation(() => {
        throw error
      })
      expect(() =>
        guard.canActivate(createMockContext({ body: { grant_type: 'authorization_code' } }))
      ).toThrow(error)
    })

    it('should propagate UNSUPPORTED_GRANT_TYPE errors unmodified', () => {
      const error = new OAuth2Exception(
        { error: OAuth2TokenErrorCode.UNSUPPORTED_GRANT_TYPE, error_description: 'unsupported' },
        HttpStatus.BAD_REQUEST
      )
      jest.spyOn(validationSubservice, 'validateTokenRequest').mockImplementation(() => {
        throw error
      })
      expect(() =>
        guard.canActivate(createMockContext({ body: { grant_type: 'client_credentials' } }))
      ).toThrow(error)
    })

    it('should propagate INVALID_REQUEST errors unmodified', () => {
      const error = new OAuth2Exception(
        {
          error: OAuth2TokenErrorCode.INVALID_REQUEST,
          error_description: 'code_verifier required',
        },
        HttpStatus.BAD_REQUEST
      )
      jest.spyOn(validationSubservice, 'validateTokenRequest').mockImplementation(() => {
        throw error
      })
      expect(() =>
        guard.canActivate(createMockContext({ body: { grant_type: 'authorization_code' } }))
      ).toThrow(error)
    })
  })

  /**
   * Request Enrichment
   *
   * CUSTOM PROXY DETAIL: Attaches validated client credentials to the request object so
   * the controller and downstream service don't have to re-parse them. Implementation-only
   * — RFC 6749 doesn't mandate any particular intra-server data flow.
   */
  describe('canActivate - request enrichment and return value', () => {
    it('should attach tokenClientId to the request object', () => {
      const context = createMockContext({ body: { grant_type: 'authorization_code' } })
      guard.canActivate(context)
      expect(getRequest(context).tokenClientId).toBe('test-client-id')
    })

    it('should attach oauth2ClientSecret to the request object', () => {
      const context = createMockContext({ body: { grant_type: 'authorization_code' } })
      guard.canActivate(context)
      expect(getRequest(context).oauth2ClientSecret).toBe('test-client-secret')
    })

    it('should handle undefined clientSecret (public client)', () => {
      jest
        .spyOn(validationSubservice, 'extractClientCredentials')
        .mockReturnValue({ clientId: 'public-client', clientSecret: undefined })
      const context = createMockContext({ body: { grant_type: 'authorization_code' } })
      guard.canActivate(context)
      expect(getRequest(context).tokenClientId).toBe('public-client')
      expect(getRequest(context).oauth2ClientSecret).toBeUndefined()
    })

    it('should return true when all validation passes', () => {
      const context = createMockContext({ body: { grant_type: 'authorization_code' } })
      expect(guard.canActivate(context)).toBe(true)
    })
  })
})
