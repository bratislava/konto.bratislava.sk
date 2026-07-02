import { createMock } from '@golevelup/ts-jest'
import { ExecutionContext, HttpStatus } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { OAuth2AuthorizationErrorCode } from '../oauth2.error.enum'
import { OAuth2Exception } from '../oauth2.exception'
import { OAuth2ValidationSubservice } from '../subservices/oauth2-validation.subservice'
import { AuthorizationRequestGuard } from './authorization-request.guard'

describe('AuthorizationRequestGuard', () => {
  let guard: AuthorizationRequestGuard
  let validationSubservice: OAuth2ValidationSubservice

  function createMockContext(query: Record<string, string> = {}): ExecutionContext {
    return {
      switchToHttp: jest.fn().mockReturnValue({ getRequest: () => ({ query }) }),
    } as any
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorizationRequestGuard,
        { provide: OAuth2ValidationSubservice, useValue: createMock<OAuth2ValidationSubservice>() },
      ],
    }).compile()

    guard = module.get<AuthorizationRequestGuard>(AuthorizationRequestGuard)
    validationSubservice = module.get<OAuth2ValidationSubservice>(OAuth2ValidationSubservice)
  })

  it('should be defined', () => {
    expect(guard).toBeDefined()
  })

  /**
   * Query Parameter Extraction and Mapping
   *
   * RFC 6749 Section 4.1.1 - Authorization Request parameters in query component
   * RFC 6749 Section 3.1 - MUST support HTTP GET for authorization endpoint
   * RFC 7636 Section 4.3 - Additional PKCE parameters: code_challenge, code_challenge_method
   */
  describe('canActivate - query parameter extraction and mapping', () => {
    it('should extract all RFC 6749 and RFC 7636 parameters from query and pass to validation', () => {
      const context = createMockContext({
        response_type: 'code',
        client_id: 'test-client-id',
        redirect_uri: 'https://example.com/callback',
        scope: 'read write',
        state: 'csrf-state-123',
        code_challenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
        code_challenge_method: 'S256',
      })
      guard.canActivate(context)
      expect(validationSubservice.validateAuthorizationRequest).toHaveBeenCalledWith({
        responseType: 'code',
        clientId: 'test-client-id',
        redirectUri: 'https://example.com/callback',
        scope: 'read write',
        state: 'csrf-state-123',
        codeChallenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
        codeChallengeMethod: 'S256',
      })
    })

    it('should handle optional parameters being absent (scope, state, PKCE)', () => {
      const context = createMockContext({
        response_type: 'code',
        client_id: 'test-client-id',
        redirect_uri: 'https://example.com/callback',
      })
      guard.canActivate(context)
      expect(validationSubservice.validateAuthorizationRequest).toHaveBeenCalledWith({
        responseType: 'code',
        clientId: 'test-client-id',
        redirectUri: 'https://example.com/callback',
        scope: undefined,
        state: undefined,
        codeChallenge: undefined,
        codeChallengeMethod: undefined,
      })
    })

    it('should pass undefined for all parameters when query is empty', () => {
      const context = createMockContext({})
      guard.canActivate(context)
      expect(validationSubservice.validateAuthorizationRequest).toHaveBeenCalledWith({
        responseType: undefined,
        clientId: undefined,
        redirectUri: undefined,
        scope: undefined,
        state: undefined,
        codeChallenge: undefined,
        codeChallengeMethod: undefined,
      })
    })
  })

  /**
   * Delegation to OAuth2ValidationSubservice
   *
   * RFC 6749 Section 4.1.1 - "The authorization server validates the request
   * to ensure that all required parameters are present and valid."
   */
  describe('canActivate - validation delegation', () => {
    it('should call validateAuthorizationRequest() exactly once', () => {
      const context = createMockContext({ response_type: 'code', client_id: 'test-client-id' })
      guard.canActivate(context)
      expect(validationSubservice.validateAuthorizationRequest).toHaveBeenCalledTimes(1)
    })

    it('should return true when validation passes', () => {
      const context = createMockContext({ response_type: 'code', client_id: 'test-client-id' })
      expect(guard.canActivate(context)).toBe(true)
    })
  })

  /**
   * Validation Error Propagation
   *
   * RFC 6749 Section 4.1.2.1 - Error codes propagate unmodified (unlike AuthRequestIdGuard
   * which wraps in SERVER_ERROR). At /authorize, original error codes are meaningful to clients.
   */
  describe('canActivate - validation error propagation', () => {
    it('should propagate INVALID_REQUEST errors from validation unmodified', () => {
      const error = new OAuth2Exception(
        {
          error: OAuth2AuthorizationErrorCode.INVALID_REQUEST,
          error_description: 'redirect_uri is required',
        },
        HttpStatus.BAD_REQUEST
      )
      jest.spyOn(validationSubservice, 'validateAuthorizationRequest').mockImplementation(() => {
        throw error
      })
      expect(() => guard.canActivate(createMockContext({ response_type: 'code' }))).toThrow(error)
    })

    it('should propagate UNAUTHORIZED_CLIENT errors from validation unmodified', () => {
      const error = new OAuth2Exception(
        {
          error: OAuth2AuthorizationErrorCode.UNAUTHORIZED_CLIENT,
          error_description: 'unknown client',
        },
        HttpStatus.BAD_REQUEST
      )
      jest.spyOn(validationSubservice, 'validateAuthorizationRequest').mockImplementation(() => {
        throw error
      })
      expect(() => guard.canActivate(createMockContext({ client_id: 'unknown' }))).toThrow(error)
    })

    it('should propagate UNSUPPORTED_RESPONSE_TYPE errors from validation unmodified', () => {
      const error = new OAuth2Exception(
        {
          error: OAuth2AuthorizationErrorCode.UNSUPPORTED_RESPONSE_TYPE,
          error_description: 'Unsupported',
        },
        HttpStatus.BAD_REQUEST
      )
      jest.spyOn(validationSubservice, 'validateAuthorizationRequest').mockImplementation(() => {
        throw error
      })
      expect(() => guard.canActivate(createMockContext({ response_type: 'token' }))).toThrow(error)
    })

    it('should propagate INVALID_SCOPE errors from validation unmodified', () => {
      const error = new OAuth2Exception(
        { error: OAuth2AuthorizationErrorCode.INVALID_SCOPE, error_description: 'Invalid scope' },
        HttpStatus.BAD_REQUEST
      )
      jest.spyOn(validationSubservice, 'validateAuthorizationRequest').mockImplementation(() => {
        throw error
      })
      expect(() => guard.canActivate(createMockContext({ scope: 'admin' }))).toThrow(error)
    })
  })
})
