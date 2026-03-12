import { createMock } from '@golevelup/ts-jest'
import { ExecutionContext, HttpStatus } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { AuthorizationRequestDto } from '../dtos/requests.oauth2.dto'
import { OAuth2AuthorizationErrorCode } from '../oauth2.error.enum'
import { OAuth2Exception } from '../oauth2.exception'
import { OAuth2Service } from '../oauth2.service'
import { OAuth2ErrorThrower } from '../oauth2-error.thrower'
import { OAuth2ValidationSubservice } from '../subservices/oauth2-validation.subservice'
import { AuthRequestIdGuard, RequestWithAuthorizationData } from './auth-request-id.guard'

/**
 * AuthRequestIdGuard
 *
 * CUSTOM OAUTH2 PROXY LAYER: This guard is part of our OAuth2 authorization server
 * that proxies Cognito. The RFCs define the external-facing contract (authorization
 * request → code → token exchange) but not how the server manages internal state.
 *
 * Our architecture splits the standard authorization flow into three steps —
 * /authorize → /store → /continue — with a server-side authRequestId linking them.
 * The frontend authenticates the user via Cognito between /authorize and /store,
 * then this guard ensures the stored authorization parameters are intact before
 * the flow continues.
 *
 * Where RFC sections are cited below, they indicate the *motivation* for the design
 * (e.g., why parameters must be stored server-side and re-validated), not that this
 * guard directly implements an RFC requirement. The actual RFC conformance happens
 * downstream when the validated parameters are used to issue codes and tokens.
 */
describe('AuthRequestIdGuard', () => {
  let guard: AuthRequestIdGuard
  let oauth2Service: OAuth2Service
  let validationSubservice: OAuth2ValidationSubservice
  let oAuth2ErrorThrower: OAuth2ErrorThrower

  const validAuthRequestId = '550e8400-e29b-41d4-a716-446655440000'

  const validAuthRequestData: AuthorizationRequestDto = {
    response_type: 'code',
    client_id: 'test-client-id',
    redirect_uri: 'https://example.com/callback',
    scope: 'read',
    state: 'csrf-state-123',
    code_challenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
    code_challenge_method: 'S256',
  }

  /**
   * Creates a minimal mock ExecutionContext.
   *
   * Only `body`, `query`, and `method` are provided because the guard only
   * accesses these properties and no other Express Request properties are used
   * by this guard.
   */
  function createMockContext(
    overrides: { body?: any; query?: any; method?: string } = {}
  ): ExecutionContext {
    const mockRequest: Partial<RequestWithAuthorizationData> = {
      body: overrides.body ?? {},
      query: overrides.query ?? {},
      method: overrides.method ?? 'GET',
    }
    return {
      switchToHttp: jest.fn().mockReturnValue({ getRequest: () => mockRequest }),
    } as any
  }

  function getRequest(context: ExecutionContext): RequestWithAuthorizationData {
    return context.switchToHttp().getRequest()
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthRequestIdGuard,
        { provide: OAuth2Service, useValue: createMock<OAuth2Service>() },
        { provide: OAuth2ValidationSubservice, useValue: createMock<OAuth2ValidationSubservice>() },
        { provide: OAuth2ErrorThrower, useValue: createMock<OAuth2ErrorThrower>() },
      ],
    }).compile()

    guard = module.get<AuthRequestIdGuard>(AuthRequestIdGuard)
    oauth2Service = module.get<OAuth2Service>(OAuth2Service)
    validationSubservice = module.get<OAuth2ValidationSubservice>(OAuth2ValidationSubservice)
    oAuth2ErrorThrower = module.get<OAuth2ErrorThrower>(OAuth2ErrorThrower)

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
  })

  it('should be defined', () => {
    expect(guard).toBeDefined()
  })

  /**
   * authRequestId Extraction
   *
   * CUSTOM PROXY DETAIL: The guard extracts authRequestId from POST body or GET query
   * depending on the endpoint — our mechanism for linking the multi-step Cognito
   * proxy authorization flow.
   */
  describe('canActivate - authRequestId extraction', () => {
    beforeEach(() => {
      jest.spyOn(oauth2Service, 'loadAuthorizationRequest').mockResolvedValue(validAuthRequestData)
    })

    it('should extract authRequestId from POST body', async () => {
      const context = createMockContext({
        body: { authRequestId: validAuthRequestId },
        method: 'POST',
      })
      await guard.canActivate(context)
      expect(oauth2Service.loadAuthorizationRequest).toHaveBeenCalledWith(validAuthRequestId)
    })

    it('should extract authRequestId from GET query parameters', async () => {
      const context = createMockContext({
        query: { authRequestId: validAuthRequestId },
        method: 'GET',
      })
      await guard.canActivate(context)
      expect(oauth2Service.loadAuthorizationRequest).toHaveBeenCalledWith(validAuthRequestId)
    })

    // FIXME is this a desired behaviour?
    it('should prefer body over query when authRequestId is present in both', async () => {
      const bodyId = '11111111-1111-1111-1111-111111111111'
      const queryId = '22222222-2222-2222-2222-222222222222'
      const context = createMockContext({
        body: { authRequestId: bodyId },
        query: { authRequestId: queryId },
      })
      await guard.canActivate(context)
      expect(oauth2Service.loadAuthorizationRequest).toHaveBeenCalledWith(bodyId)
    })
  })

  /**
   * Missing or Invalid authRequestId
   *
   * CUSTOM PROXY DETAIL: Without a valid authRequestId the guard cannot load stored
   * parameters, so the Cognito proxy authorization flow cannot proceed.
   */
  describe('canActivate - missing or invalid authRequestId', () => {
    it('should throw SERVER_ERROR when authRequestId is missing from both body and query', async () => {
      const context = createMockContext({ body: {}, query: {} })
      await expect(guard.canActivate(context)).rejects.toThrow(OAuth2Exception)
      const callArgs = jest.mocked(oAuth2ErrorThrower).authorizationException.mock.calls[0]
      expect(callArgs?.[0]).toBe(OAuth2AuthorizationErrorCode.SERVER_ERROR)
      expect(callArgs?.[4]).toMatchObject({
        hasBodyAuthRequestId: false,
        hasQueryAuthRequestId: false,
      })
    })

    it('should throw SERVER_ERROR when authRequestId is not a string (defensive — DTO validation prevents this in practice)', async () => {
      // In practice, POST body is validated by StoreTokensRequestDto (@IsUUID)
      // before guard runs, and GET query params are always strings in Express.
      // This tests the defensive type of check.
      const context = createMockContext({ body: { authRequestId: 12345 } })
      await expect(guard.canActivate(context)).rejects.toThrow(OAuth2Exception)
      const callArgs = jest.mocked(oAuth2ErrorThrower).authorizationException.mock.calls[0]
      expect(callArgs?.[0]).toBe(OAuth2AuthorizationErrorCode.SERVER_ERROR)
      expect(callArgs?.[4]).toMatchObject({ authRequestIdType: 'number' })
    })

    it('should throw SERVER_ERROR when authRequestId is an empty string', async () => {
      const context = createMockContext({ body: { authRequestId: '' } })
      await expect(guard.canActivate(context)).rejects.toThrow(OAuth2Exception)
      const callArgs = jest.mocked(oAuth2ErrorThrower).authorizationException.mock.calls[0]
      expect(callArgs?.[0]).toBe(OAuth2AuthorizationErrorCode.SERVER_ERROR)
    })

    it('should include diagnostic metadata in the error (method, body/query presence)', async () => {
      const context = createMockContext({ query: { authRequestId: 42 }, method: 'GET' })
      await expect(guard.canActivate(context)).rejects.toThrow(OAuth2Exception)
      const callArgs = jest.mocked(oAuth2ErrorThrower).authorizationException.mock.calls[0]
      expect(callArgs?.[4]).toMatchObject({
        hasBodyAuthRequestId: false,
        hasQueryAuthRequestId: true,
        authRequestIdType: 'number',
        method: 'GET',
      })
    })
  })

  /**
   * Loading Authorization Request from Database
   *
   * CUSTOM PROXY DETAIL: Server-side storage of authorization parameters.
   *
   * The motivation for storing parameters server-side comes from RFC requirements
   * that apply later in the flow:
   *   - RFC 7636 Section 4.4: code_challenge must be associated with the auth code
   *   - RFC 6819 Section 5.2.4.4: auth code must be bound to client_id
   *   - RFC 6819 Section 5.2.4.5: auth code must be bound to redirect_uri
   * By storing all parameters at /authorize time and loading them here, we ensure
   * they cannot be tampered with before they're needed for code issuance and token
   * exchange downstream.
   */
  describe('canActivate - loading authorization request from database', () => {
    it('should load authorization request via oauth2Service.loadAuthorizationRequest()', async () => {
      jest.spyOn(oauth2Service, 'loadAuthorizationRequest').mockResolvedValue(validAuthRequestData)
      const context = createMockContext({ body: { authRequestId: validAuthRequestId } })
      await guard.canActivate(context)
      expect(oauth2Service.loadAuthorizationRequest).toHaveBeenCalledWith(validAuthRequestId)
      expect(oauth2Service.loadAuthorizationRequest).toHaveBeenCalledTimes(1)
    })

    it('should throw SERVER_ERROR when loadAuthorizationRequest() throws (database failure)', async () => {
      const dbError = new Error('Connection refused')
      jest.spyOn(oauth2Service, 'loadAuthorizationRequest').mockRejectedValue(dbError)
      const context = createMockContext({ body: { authRequestId: validAuthRequestId } })
      await expect(guard.canActivate(context)).rejects.toThrow(OAuth2Exception)
      const callArgs = jest.mocked(oAuth2ErrorThrower).authorizationException.mock.calls[0]
      expect(callArgs?.[0]).toBe(OAuth2AuthorizationErrorCode.SERVER_ERROR)
      expect(callArgs?.[1]).toContain('failed to process authorization request')
      expect(callArgs?.[4]).toMatchObject({ authRequestId: validAuthRequestId, error: dbError })
    })

    it('should throw SERVER_ERROR when authorization request is not found (null)', async () => {
      jest.spyOn(oauth2Service, 'loadAuthorizationRequest').mockResolvedValue(undefined as any)
      const context = createMockContext({
        body: { authRequestId: validAuthRequestId },
        method: 'POST',
      })
      await expect(guard.canActivate(context)).rejects.toThrow(OAuth2Exception)
      const callArgs = jest.mocked(oAuth2ErrorThrower).authorizationException.mock.calls[0]
      expect(callArgs?.[0]).toBe(OAuth2AuthorizationErrorCode.SERVER_ERROR)
      expect(callArgs?.[1]).toContain('not found or expired')
    })

    it('should include authRequestId in error metadata for not-found errors', async () => {
      jest.spyOn(oauth2Service, 'loadAuthorizationRequest').mockResolvedValue(undefined as any)
      const context = createMockContext({
        query: { authRequestId: validAuthRequestId },
        method: 'GET',
      })
      await expect(guard.canActivate(context)).rejects.toThrow(OAuth2Exception)
      const callArgs = jest.mocked(oAuth2ErrorThrower).authorizationException.mock.calls[0]
      expect(callArgs?.[4]).toMatchObject({ authRequestId: validAuthRequestId, method: 'GET' })
    })
  })

  /**
   * Re-validation of Stored Authorization Parameters
   *
   * CUSTOM PROXY DETAIL: After loading stored parameters, the guard re-validates them
   * through the same validation subservice used by the /authorize endpoint. This is
   * a defensive measure specific to our proxy architecture that catches:
   *   - Database corruption or unauthorized modification of stored parameters
   *   - Client configuration changes between the initial request and continuation
   *     (e.g., a redirect_uri removed from the allowlist, client deregistered)
   *
   * The validation subservice itself enforces RFC requirements (RFC 6749 Section 4.1.1
   * parameter validation, RFC 6749 Section 10.14 input sanitization), but calling it
   * here from the guard is our custom decision to re-check before proceeding.
   */
  describe('canActivate - re-validation of stored authorization parameters', () => {
    beforeEach(() => {
      jest.spyOn(oauth2Service, 'loadAuthorizationRequest').mockResolvedValue(validAuthRequestData)
    })

    it('should call validateAuthorizationRequest() with mapped parameters from loaded data', async () => {
      const context = createMockContext({ body: { authRequestId: validAuthRequestId } })
      await guard.canActivate(context)
      expect(validationSubservice.validateAuthorizationRequest).toHaveBeenCalledWith({
        responseType: validAuthRequestData.response_type,
        clientId: validAuthRequestData.client_id,
        redirectUri: validAuthRequestData.redirect_uri,
        scope: validAuthRequestData.scope,
        state: validAuthRequestData.state,
        codeChallenge: validAuthRequestData.code_challenge,
        codeChallengeMethod: validAuthRequestData.code_challenge_method,
      })
    })

    it('should throw SERVER_ERROR when re-validation fails (corrupted stored parameters)', async () => {
      jest.spyOn(validationSubservice, 'validateAuthorizationRequest').mockImplementation(() => {
        throw new OAuth2Exception(
          {
            error: OAuth2AuthorizationErrorCode.UNAUTHORIZED_CLIENT,
            error_description: 'Unknown client',
          },
          HttpStatus.BAD_REQUEST
        )
      })
      const context = createMockContext({
        body: { authRequestId: validAuthRequestId },
        method: 'POST',
      })
      await expect(guard.canActivate(context)).rejects.toThrow(OAuth2Exception)
      const callArgs = jest.mocked(oAuth2ErrorThrower).authorizationException.mock.calls[0]
      expect(callArgs?.[0]).toBe(OAuth2AuthorizationErrorCode.SERVER_ERROR)
      expect(callArgs?.[1]).toContain('parameters are corrupted')
    })

    it('should throw SERVER_ERROR (not the original validation error) to avoid leaking details', async () => {
      // The guard wraps the specific validation error in a generic SERVER_ERROR.
      // The original error (e.g., INVALID_SCOPE, UNAUTHORIZED_CLIENT) is only
      // logged internally — it would be confusing to the client since they didn't
      // send these parameters in this request.
      jest.spyOn(validationSubservice, 'validateAuthorizationRequest').mockImplementation(() => {
        throw new OAuth2Exception(
          {
            error: OAuth2AuthorizationErrorCode.INVALID_SCOPE,
            error_description: 'Scope no longer valid',
          },
          HttpStatus.BAD_REQUEST
        )
      })
      const context = createMockContext({ body: { authRequestId: validAuthRequestId } })
      await expect(guard.canActivate(context)).rejects.toThrow(OAuth2Exception)
      const callArgs = jest.mocked(oAuth2ErrorThrower).authorizationException.mock.calls[0]
      expect(callArgs?.[0]).toBe(OAuth2AuthorizationErrorCode.SERVER_ERROR)
      expect(oAuth2ErrorThrower.authorizationException).not.toHaveBeenCalledWith(
        OAuth2AuthorizationErrorCode.INVALID_SCOPE,
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything()
      )
    })
  })

  /**
   * Request Enrichment
   *
   * CUSTOM PROXY DETAIL: NestJS guard pattern — attaches validated data to the request
   * object so downstream controllers and services can access it without re-loading
   * from the database.
   */
  describe('canActivate - request enrichment and return value', () => {
    beforeEach(() => {
      jest.spyOn(oauth2Service, 'loadAuthorizationRequest').mockResolvedValue(validAuthRequestData)
    })

    it('should attach authorizationRequestData to the request object', async () => {
      const context = createMockContext({ body: { authRequestId: validAuthRequestId } })
      await guard.canActivate(context)
      expect(getRequest(context).authorizationRequestData).toBe(validAuthRequestData)
    })

    it('should return true when all validation passes', async () => {
      const context = createMockContext({ body: { authRequestId: validAuthRequestId } })
      const result = await guard.canActivate(context)
      expect(result).toBe(true)
    })
  })
})
