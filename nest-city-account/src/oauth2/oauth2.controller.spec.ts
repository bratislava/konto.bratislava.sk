import { createMock } from '@golevelup/ts-jest'
import { HttpStatus } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { Response } from 'express'

import { HttpsGuard } from '../utils/guards/https.guard'
import { AuthorizationRequestDto } from './dtos/requests.oauth2.dto'
import { OAuth2ExceptionFilter } from './filters/oauth2-exception.filter'
import { AuthRequestIdGuard, RequestWithAuthorizationData } from './guards/auth-request-id.guard'
import { AuthorizationRequestGuard } from './guards/authorization-request.guard'
import { RequestWithClientCredentials, TokenRequestGuard } from './guards/token-request.guard'
import { OAuth2Controller } from './oauth2.controller'
import { OAuth2AuthorizationErrorCode } from './oauth2.error.enum'
import { OAuth2Exception } from './oauth2.exception'
import { OAuth2Service } from './oauth2.service'
import { OAuth2ErrorThrower } from './oauth2-error.thrower'
import { TokenRequestValidationPipe } from './pipes/token-request-validation.pipe'

describe('OAuth2Controller', () => {
  let controller: OAuth2Controller
  let oauth2Service: OAuth2Service
  let oAuth2ErrorThrower: OAuth2ErrorThrower

  const validAuthRequestData: AuthorizationRequestDto = {
    response_type: 'code',
    client_id: 'test-client-id',
    redirect_uri: 'https://example.com/callback',
    scope: 'read',
    state: 'csrf-123',
    code_challenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
    code_challenge_method: 'S256',
  }

  function mockResponse(): Response {
    return { redirect: jest.fn() } as any
  }

  function mockReqWithAuthData(
    overrides: { body?: any; query?: any } = {}
  ): RequestWithAuthorizationData {
    return {
      body: overrides.body ?? {},
      query: overrides.query ?? {},
      authorizationRequestData: validAuthRequestData,
    } as any
  }

  function mockReqWithCreds(
    overrides: { body?: any; tokenClientId?: string; oauth2ClientSecret?: string } = {}
  ): RequestWithClientCredentials {
    return {
      body: overrides.body ?? {},
      tokenClientId: overrides.tokenClientId,
      oauth2ClientSecret: overrides.oauth2ClientSecret,
    } as any
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OAuth2Controller],
      providers: [
        { provide: OAuth2Service, useValue: createMock<OAuth2Service>() },
        { provide: OAuth2ErrorThrower, useValue: createMock<OAuth2ErrorThrower>() },
      ],
    })
      .overrideGuard(HttpsGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AuthorizationRequestGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AuthRequestIdGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(TokenRequestGuard)
      .useValue({ canActivate: () => true })
      .overrideFilter(OAuth2ExceptionFilter)
      .useValue({ catch: jest.fn() })
      .overridePipe(TokenRequestValidationPipe)
      .useValue({ transform: (v: any) => v })
      .compile()

    controller = module.get<OAuth2Controller>(OAuth2Controller)
    oauth2Service = module.get<OAuth2Service>(OAuth2Service)
    oAuth2ErrorThrower = module.get<OAuth2ErrorThrower>(OAuth2ErrorThrower)

    jest
      .spyOn(oAuth2ErrorThrower, 'authorizationException')
      .mockImplementation(
        (errorCode, errorDescription) =>
          new OAuth2Exception(
            { error: errorCode, error_description: errorDescription },
            HttpStatus.BAD_REQUEST
          )
      )
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  /**
   * GET /oauth2/authorize - Authorization Endpoint
   *
   * RFC 6749 Section 4.1.1 - Authorization Request
   * RFC 9700 - Use 303 See Other for OAuth2 redirects
   * CUSTOM PROXY DETAIL: Redirects to frontend login page, not a consent screen.
   * The endpoint conforms to the RFC contract; the redirect target is implementation-specific.
   */
  describe('authorize', () => {
    it('should store authorization request via service', async () => {
      jest.spyOn(oauth2Service, 'storeAuthorizationRequest').mockResolvedValue('auth-req-id-123')
      jest
        .spyOn(oauth2Service, 'buildLoginRedirectUrl')
        .mockReturnValue('https://login.example.com')
      await controller.authorize(validAuthRequestData, mockResponse())
      expect(oauth2Service.storeAuthorizationRequest).toHaveBeenCalledWith(validAuthRequestData)
    })

    it('should build login redirect URL with query and authRequestId', async () => {
      jest.spyOn(oauth2Service, 'storeAuthorizationRequest').mockResolvedValue('auth-req-id-123')
      jest
        .spyOn(oauth2Service, 'buildLoginRedirectUrl')
        .mockReturnValue('https://login.example.com')
      await controller.authorize(validAuthRequestData, mockResponse())
      expect(oauth2Service.buildLoginRedirectUrl).toHaveBeenCalledWith(
        validAuthRequestData,
        'auth-req-id-123'
      )
    })

    it('should redirect with 303 See Other per RFC 9700', async () => {
      jest.spyOn(oauth2Service, 'storeAuthorizationRequest').mockResolvedValue('auth-req-id-123')
      const url = 'https://login.example.com?authRequestId=auth-req-id-123'
      jest.spyOn(oauth2Service, 'buildLoginRedirectUrl').mockReturnValue(url)
      const res = mockResponse()
      await controller.authorize(validAuthRequestData, res)
      expect(res.redirect).toHaveBeenCalledWith(HttpStatus.SEE_OTHER, url)
    })

    it('should propagate service exceptions from storeAuthorizationRequest', async () => {
      // CUSTOM PROXY DETAIL: Service errors (e.g., DB failure) propagate to the exception filter
      jest.spyOn(oauth2Service, 'storeAuthorizationRequest').mockRejectedValue(new Error('DB down'))
      await expect(controller.authorize(validAuthRequestData, mockResponse())).rejects.toThrow(
        'DB down'
      )
    })
  })

  /**
   * POST /oauth2/store - Store Tokens Endpoint
   * CUSTOM PROXY DETAIL: Custom endpoint for the split authorization flow used by our
   * Cognito proxy. Not part of any RFC, but feeds into the RFC-conformant /token endpoint.
   */
  describe('storeTokens', () => {
    it('should call service with authRequestId, client_id, and refreshToken', async () => {
      const req = mockReqWithAuthData({
        body: { authRequestId: 'auth-req-id-123', refreshToken: 'refresh-abc' },
      })
      await controller.storeTokens(
        { authRequestId: 'auth-req-id-123', refreshToken: 'refresh-abc' },
        req
      )
      expect(oauth2Service.storeTokensForAuthRequest).toHaveBeenCalledWith(
        'auth-req-id-123',
        'test-client-id',
        'refresh-abc'
      )
    })
  })

  /**
   * GET /oauth2/continue - Continue Authorization Endpoint
   *
   * RFC 6749 Section 4.1.2 - Authorization Response (deliver auth code via redirect)
   * RFC 9700 - 303 See Other
   */
  describe('continueComplete', () => {
    it('should check if tokens are stored before generating authorization code', async () => {
      jest.spyOn(oauth2Service, 'areTokensStoredForAuthRequest').mockResolvedValue(true)
      jest
        .spyOn(oauth2Service, 'continueAuthorization')
        .mockResolvedValue({ code: 'code-xyz', state: 'csrf-123' })
      jest
        .spyOn(oauth2Service, 'buildAuthorizationResponseRedirectUrl')
        .mockReturnValue('https://example.com/callback?code=code-xyz')
      const req = mockReqWithAuthData({ query: { authRequestId: 'auth-req-id-123' } })
      await controller.continueComplete({ authRequestId: 'auth-req-id-123' }, req, mockResponse())
      expect(oauth2Service.areTokensStoredForAuthRequest).toHaveBeenCalledWith('auth-req-id-123')
    })

    it('should throw SERVER_ERROR when tokens are not stored', async () => {
      jest.spyOn(oauth2Service, 'areTokensStoredForAuthRequest').mockResolvedValue(false)
      const req = mockReqWithAuthData({ query: { authRequestId: 'auth-req-id-123' } })
      await expect(
        controller.continueComplete({ authRequestId: 'auth-req-id-123' }, req, mockResponse())
      ).rejects.toThrow(OAuth2Exception)
      expect(oAuth2ErrorThrower.authorizationException).toHaveBeenCalledWith(
        OAuth2AuthorizationErrorCode.SERVER_ERROR,
        expect.stringContaining('unable to provide tokens')
      )
    })

    it('should generate authorization code and redirect with 303 per RFC 9700', async () => {
      jest.spyOn(oauth2Service, 'areTokensStoredForAuthRequest').mockResolvedValue(true)
      jest
        .spyOn(oauth2Service, 'continueAuthorization')
        .mockResolvedValue({ code: 'code-xyz', state: 'csrf-123' })
      const redirectUrl = 'https://example.com/callback?code=code-xyz&state=csrf-123'
      jest
        .spyOn(oauth2Service, 'buildAuthorizationResponseRedirectUrl')
        .mockReturnValue(redirectUrl)
      const res = mockResponse()
      const req = mockReqWithAuthData({ query: { authRequestId: 'auth-req-id-123' } })
      await controller.continueComplete({ authRequestId: 'auth-req-id-123' }, req, res)
      expect(oauth2Service.continueAuthorization).toHaveBeenCalledWith(
        'auth-req-id-123',
        validAuthRequestData
      )
      expect(oauth2Service.buildAuthorizationResponseRedirectUrl).toHaveBeenCalledWith(
        'https://example.com/callback',
        { code: 'code-xyz', state: 'csrf-123' }
      )
      expect(res.redirect).toHaveBeenCalledWith(HttpStatus.SEE_OTHER, redirectUrl)
    })
  })

  /**
   * POST /oauth2/token - Token Endpoint
   *
   * RFC 6749 Section 5.1 - Successful token response
   * RFC 6749 Section 4.1.3 - authorization_code grant
   * RFC 6749 Section 6 - refresh_token grant
   */
  describe('token', () => {
    it('should normalize client credentials from guard into request body', async () => {
      // RFC 6749 Section 2.3.1: Client credentials extracted from HTTP Basic Auth by guard
      jest
        .spyOn(oauth2Service, 'token')
        .mockResolvedValue({ access_token: 'at', token_type: 'Bearer', expires_in: 3600 })
      const body: any = { grant_type: 'authorization_code', code: 'xyz' }
      const req = mockReqWithCreds({
        body,
        tokenClientId: 'guard-client',
        oauth2ClientSecret: 'guard-secret',
      })
      await controller.token(body, req)
      expect(body.client_id).toBe('guard-client')
      expect(body.client_secret).toBe('guard-secret')
    })

    it('should not overwrite body credentials when guard credentials are absent', async () => {
      jest
        .spyOn(oauth2Service, 'token')
        .mockResolvedValue({ access_token: 'at', token_type: 'Bearer', expires_in: 3600 })
      const body: any = { grant_type: 'authorization_code', client_id: 'body-client' }
      const req = mockReqWithCreds({ body, tokenClientId: 'guard-client' }) // oauth2ClientSecret undefined
      await controller.token(body, req)
      expect(body.client_id).toBe('body-client') // not overwritten
    })

    it('should delegate to oauth2Service.token() and return the result', async () => {
      const tokenResponse = {
        access_token: 'at',
        token_type: 'Bearer' as const,
        expires_in: 3600,
        refresh_token: 'rt',
      }
      jest.spyOn(oauth2Service, 'token').mockResolvedValue(tokenResponse)
      const body: any = { grant_type: 'authorization_code', code: 'xyz' }
      const result = await controller.token(body, mockReqWithCreds({ body }))
      expect(oauth2Service.token).toHaveBeenCalledWith(body)
      expect(result).toBe(tokenResponse)
    })
  })

  /**
   * GET /oauth2/info - Client Info Endpoint
   * CUSTOM PROXY DETAIL: Returns client public name and ID for frontend display
   * during the custom split-flow login UI. Not part of any RFC.
   */
  describe('info', () => {
    it('should return client info using client_id from authorizationRequestData', () => {
      const clientInfo = { clientId: 'test-client-id', clientName: 'Test App' }
      jest.spyOn(oauth2Service, 'getClientInfo').mockReturnValue(clientInfo)
      const req = mockReqWithAuthData({ query: { authRequestId: 'auth-req-id-123' } })
      const result = controller.info({ authRequestId: 'auth-req-id-123' }, req)
      expect(oauth2Service.getClientInfo).toHaveBeenCalledWith('test-client-id')
      expect(result).toBe(clientInfo)
    })
  })
})
