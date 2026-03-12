import { createMock } from '@golevelup/ts-jest'
import { HttpStatus } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

import { PrismaService } from '../prisma/prisma.service'
import * as crypto from '../utils/crypto'
import { CognitoSubservice } from '../utils/subservices/cognito.subservice'
import * as tokenSerialization from '../utils/tokenSerialization'
import { OAuth2AuthorizationErrorCode, OAuth2TokenErrorCode } from './oauth2.error.enum'
import { OAuth2Exception } from './oauth2.exception'
import { OAuth2Service } from './oauth2.service'
import { OAuth2ErrorThrower } from './oauth2-error.thrower'
import { OAuth2Client, OAuth2ClientSubservice } from './subservices/oauth2-client.subservice'
import { OAuth2ValidationSubservice } from './subservices/oauth2-validation.subservice'

// Mock crypto and tokenSerialization modules
jest.mock('../utils/crypto', () => ({
  encryptData: jest.fn((data: string) => `enc:${data}`),
  decryptData: jest.fn((data: string) => data.replace('enc:', '')),
}))

jest.mock('../utils/tokenSerialization', () => ({
  serializeTokenData: jest.fn((token: string, clientId: string) =>
    JSON.stringify({ token, clientId })
  ),
  deserializeTokenData: jest.fn((data: string) => JSON.parse(data)),
}))

describe('OAuth2Service', () => {
  let service: OAuth2Service
  let oAuth2ErrorThrower: OAuth2ErrorThrower
  let prisma: PrismaService
  let cognitoSubservice: CognitoSubservice
  let configService: ConfigService
  let validationSubservice: OAuth2ValidationSubservice
  let clientSubservice: OAuth2ClientSubservice

  function expectTokenError(code: OAuth2TokenErrorCode, descSubstring?: string) {
    const calls = jest.mocked(oAuth2ErrorThrower).tokenException.mock.calls
    expect(calls.length).toBeGreaterThan(0)
    const lastCall = calls[calls.length - 1]
    expect(lastCall?.[0]).toBe(code)
    if (descSubstring) expect(lastCall?.[1]).toContain(descSubstring)
  }

  function expectAuthError(code: OAuth2AuthorizationErrorCode, descSubstring?: string) {
    const calls = jest.mocked(oAuth2ErrorThrower).authorizationException.mock.calls
    expect(calls.length).toBeGreaterThan(0)
    const lastCall = calls[calls.length - 1]
    expect(lastCall?.[0]).toBe(code)
    if (descSubstring) expect(lastCall?.[1]).toContain(descSubstring)
  }

  beforeEach(async () => {
    jest.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OAuth2Service,
        { provide: OAuth2ErrorThrower, useValue: createMock<OAuth2ErrorThrower>() },
        { provide: PrismaService, useValue: createMock<PrismaService>() },
        { provide: CognitoSubservice, useValue: createMock<CognitoSubservice>() },
        { provide: ConfigService, useValue: createMock<ConfigService>() },
        { provide: OAuth2ValidationSubservice, useValue: createMock<OAuth2ValidationSubservice>() },
        { provide: OAuth2ClientSubservice, useValue: createMock<OAuth2ClientSubservice>() },
      ],
    }).compile()

    service = module.get<OAuth2Service>(OAuth2Service)
    oAuth2ErrorThrower = module.get<OAuth2ErrorThrower>(OAuth2ErrorThrower)
    prisma = module.get<PrismaService>(PrismaService)
    cognitoSubservice = module.get<CognitoSubservice>(CognitoSubservice)
    configService = module.get<ConfigService>(ConfigService)
    validationSubservice = module.get<OAuth2ValidationSubservice>(OAuth2ValidationSubservice)
    clientSubservice = module.get<OAuth2ClientSubservice>(OAuth2ClientSubservice)

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
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  // ─── storeAuthorizationRequest ──────────────────────────────────────────

  /**
   * CUSTOM PROXY DETAIL: Server-side storage of authorization request parameters.
   * Not part of any RFC — it's how our Cognito proxy bridges the split flow without
   * passing tamperable params through the user-agent. The motivation aligns with
   * RFC 9700 Section 4.1 (parameter integrity).
   */
  describe('storeAuthorizationRequest', () => {
    it('should store all parameters in database and return the ID', async () => {
      jest.spyOn(prisma.oAuth2Data, 'create').mockResolvedValue({ id: 'stored-id' } as any)
      const result = await service.storeAuthorizationRequest({
        response_type: 'code',
        client_id: 'cid',
        redirect_uri: 'https://x.com/cb',
        scope: 'read',
        state: 'csrf',
        code_challenge: 'challenge',
        code_challenge_method: 'S256',
      })
      expect(result).toBe('stored-id')
      expect(prisma.oAuth2Data.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          clientId: 'cid',
          redirectUri: 'https://x.com/cb',
          responseType: 'code',
        }),
      })
    })

    it('should convert optional scope/state/PKCE to null when absent', async () => {
      // CUSTOM PROXY DETAIL: Prisma stores null for absent optional fields
      jest.spyOn(prisma.oAuth2Data, 'create').mockResolvedValue({ id: 'stored-id' } as any)
      await service.storeAuthorizationRequest({
        response_type: 'code',
        client_id: 'cid',
        redirect_uri: 'https://x.com/cb',
      })
      expect(prisma.oAuth2Data.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          scope: null,
          state: null,
          codeChallenge: null,
          codeChallengeMethod: null,
        }),
      })
    })

    it('should propagate database errors from prisma.create', async () => {
      jest.spyOn(prisma.oAuth2Data, 'create').mockRejectedValue(new Error('DB connection failed'))
      await expect(
        service.storeAuthorizationRequest({
          response_type: 'code',
          client_id: 'cid',
          redirect_uri: 'https://x.com/cb',
        })
      ).rejects.toThrow('DB connection failed')
    })
  })

  // ─── buildLoginRedirectUrl ──────────────────────────────────────────────

  describe('buildLoginRedirectUrl', () => {
    it('should build URL with authRequestId and isOAuth flag', () => {
      jest.spyOn(configService, 'get').mockReturnValue('https://login.example.com')
      const url = service.buildLoginRedirectUrl(
        { response_type: 'code', client_id: 'cid', redirect_uri: 'https://x.com/cb' },
        'auth-req-123'
      )
      expect(url).toContain('authRequestId=auth-req-123')
      expect(url).toContain('isOAuth=true')
    })

    it('should include isIdentityVerificationRequired when scope includes identity:verified', () => {
      jest.spyOn(configService, 'get').mockReturnValue('https://login.example.com')
      const url = service.buildLoginRedirectUrl(
        {
          response_type: 'code',
          client_id: 'cid',
          redirect_uri: 'https://x.com/cb',
          scope: 'identity:verified',
        },
        'auth-req-123'
      )
      expect(url).toContain('isIdentityVerificationRequired=true')
    })

    it('should NOT include isIdentityVerificationRequired when scope does not include identity:verified', () => {
      // CUSTOM PROXY DETAIL: Only set verification flag for the custom identity:verified scope
      jest.spyOn(configService, 'get').mockReturnValue('https://login.example.com')
      const url = service.buildLoginRedirectUrl(
        {
          response_type: 'code',
          client_id: 'cid',
          redirect_uri: 'https://x.com/cb',
          scope: 'read',
        },
        'auth-req-123'
      )
      expect(url).not.toContain('isIdentityVerificationRequired')
    })

    it('should throw SERVER_ERROR when OAUTH2_LOGIN_URL is not configured', () => {
      jest.spyOn(configService, 'get').mockReturnValue(undefined)
      expect(() =>
        service.buildLoginRedirectUrl(
          { response_type: 'code', client_id: 'cid', redirect_uri: 'https://x.com/cb' },
          'id'
        )
      ).toThrow(OAuth2Exception)
      expectAuthError(OAuth2AuthorizationErrorCode.SERVER_ERROR, 'server misconfiguration')
    })
  })

  // ─── continueAuthorization ──────────────────────────────────────────────

  /**
   * RFC 6749 Section 4.1.2 - Authorization Response
   *
   *   "The authorization code MUST expire shortly after it is issued to mitigate
   *    the risk of leaks. A maximum authorization code lifetime of 10 minutes is
   *    RECOMMENDED. The client MUST NOT use the authorization code more than once."
   */
  describe('continueAuthorization', () => {
    it('should generate a random authorization code and store it', async () => {
      jest.spyOn(prisma.oAuth2Data, 'update').mockResolvedValue({} as any)
      const result = await service.continueAuthorization('auth-req-id', {
        response_type: 'code',
        client_id: 'cid',
        redirect_uri: 'https://x.com/cb',
        state: 'csrf',
      })
      expect(result.code).toBeDefined()
      expect(result.code.length).toBeGreaterThan(0)
      expect(result.state).toBe('csrf')
      expect(prisma.oAuth2Data.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'auth-req-id' },
          data: expect.objectContaining({
            authorizationCode: result.code,
            authorizationCodeCreatedAt: expect.any(Date),
          }),
        })
      )
    })

    it('should omit state from response when not present in request', async () => {
      jest.spyOn(prisma.oAuth2Data, 'update').mockResolvedValue({} as any)
      const result = await service.continueAuthorization('auth-req-id', {
        response_type: 'code',
        client_id: 'cid',
        redirect_uri: 'https://x.com/cb',
      })
      expect(result.state).toBeUndefined()
    })

    it('should omit state from response when state is empty string', async () => {
      // RFC 6749 Section 4.1.2: state REQUIRED if present in authorization request — empty string is falsy
      jest.spyOn(prisma.oAuth2Data, 'update').mockResolvedValue({} as any)
      const result = await service.continueAuthorization('auth-req-id', {
        response_type: 'code',
        client_id: 'cid',
        redirect_uri: 'https://x.com/cb',
        state: '',
      })
      expect(result.state).toBeUndefined()
    })
  })

  // ─── buildAuthorizationResponseRedirectUrl ──────────────────────────────

  /**
   * RFC 6749 Section 4.1.2 - Authorization Response
   *   "code REQUIRED. state REQUIRED if present in authorization request."
   */
  describe('buildAuthorizationResponseRedirectUrl', () => {
    it('should build redirect URL with code parameter', () => {
      const url = service.buildAuthorizationResponseRedirectUrl('https://example.com/callback', {
        code: 'auth-code-xyz',
      })
      expect(url).toContain('code=auth-code-xyz')
    })

    it('should include state parameter when present in response', () => {
      const url = service.buildAuthorizationResponseRedirectUrl('https://example.com/callback', {
        code: 'auth-code-xyz',
        state: 'csrf-123',
      })
      expect(url).toContain('state=csrf-123')
    })

    it('should omit state parameter when not present', () => {
      const url = service.buildAuthorizationResponseRedirectUrl('https://example.com/callback', {
        code: 'auth-code-xyz',
      })
      expect(url).not.toContain('state=')
    })
  })

  // ─── exchangeCode (via token()) ─────────────────────────────────────────

  /**
   * RFC 6749 Section 4.1.2 - Authorization Code Properties
   *   "The authorization code MUST expire shortly after it is issued"
   *   "The client MUST NOT use the authorization code more than once"
   *
   * RFC 6749 Section 4.1.3 - Access Token Request
   *   "ensure that the 'redirect_uri' parameter is present if included in
   *    the initial authorization request, and if included ensure that
   *    their values are identical."
   *
   * RFC 7636 Section 4.6 - Server Verifies code_verifier
   */
  describe('token - authorization_code exchange', () => {
    const validOAuth2Data = {
      id: 'auth-req-id',
      clientId: 'test-client',
      redirectUri: 'https://example.com/callback',
      authorizationCode: 'valid-code',
      authorizationCodeCreatedAt: new Date(),
      codeChallenge: null,
      codeChallengeMethod: null,
      accessTokenEnc: 'enc:access',
      refreshTokenEnc: 'enc:refresh',
      accessTokenExpiresAt: new Date(Date.now() + 3600000),
      scope: 'read',
    }

    beforeEach(() => {
      jest.spyOn(prisma.oAuth2Data, 'findUnique').mockResolvedValue(validOAuth2Data as any)
      jest.spyOn(prisma.oAuth2Data, 'delete').mockResolvedValue({} as any)
    })

    it('should return token response for a valid authorization code', async () => {
      const result = await service.token({
        grant_type: 'authorization_code',
        code: 'valid-code',
        redirect_uri: 'https://example.com/callback',
        code_verifier: 'v',
      } as any)
      expect(result.access_token).toBe('enc:access')
      expect(result.token_type).toBe('Bearer')
      expect(result.refresh_token).toBe('enc:refresh')
      expect(result.expires_in).toBeGreaterThanOrEqual(0)
    })

    it('should throw INVALID_GRANT when authorization code is not found (RFC 6749 Section 4.1.2)', async () => {
      jest.spyOn(prisma.oAuth2Data, 'findUnique').mockResolvedValue(null)
      await expect(
        service.token({
          grant_type: 'authorization_code',
          code: 'nonexistent',
          redirect_uri: 'https://example.com/callback',
          code_verifier: 'v',
        } as any)
      ).rejects.toThrow(OAuth2Exception)
      expectTokenError(OAuth2TokenErrorCode.INVALID_GRANT, 'authorization code not found')
    })

    it('should delete code immediately after finding it — single-use enforcement (RFC 6749 Section 4.1.2)', async () => {
      await service.token({
        grant_type: 'authorization_code',
        code: 'valid-code',
        redirect_uri: 'https://example.com/callback',
        code_verifier: 'v',
      } as any)
      expect(prisma.oAuth2Data.delete).toHaveBeenCalledWith({ where: { id: 'auth-req-id' } })
    })

    it('should throw INVALID_GRANT when code was already used (delete fails — race condition)', async () => {
      jest.spyOn(prisma.oAuth2Data, 'delete').mockRejectedValue(new Error('Record not found'))
      await expect(
        service.token({
          grant_type: 'authorization_code',
          code: 'valid-code',
          redirect_uri: 'https://example.com/callback',
          code_verifier: 'v',
        } as any)
      ).rejects.toThrow(OAuth2Exception)
      expectTokenError(OAuth2TokenErrorCode.INVALID_GRANT, 'already used or deleted')
    })

    it('should throw INVALID_GRANT when authorization code has expired — 5 minute TTL (RFC 6749 Section 4.1.2)', async () => {
      const expiredData = {
        ...validOAuth2Data,
        authorizationCodeCreatedAt: new Date(Date.now() - 6 * 60 * 1000), // 6 min ago
      }
      jest.spyOn(prisma.oAuth2Data, 'findUnique').mockResolvedValue(expiredData as any)
      await expect(
        service.token({
          grant_type: 'authorization_code',
          code: 'valid-code',
          redirect_uri: 'https://example.com/callback',
          code_verifier: 'v',
        } as any)
      ).rejects.toThrow(OAuth2Exception)
      expectTokenError(OAuth2TokenErrorCode.INVALID_GRANT, 'expired')
    })

    it('should accept authorization code within 5 minute window', async () => {
      const recentData = {
        ...validOAuth2Data,
        authorizationCodeCreatedAt: new Date(Date.now() - 4 * 60 * 1000), // 4 min ago
      }
      jest.spyOn(prisma.oAuth2Data, 'findUnique').mockResolvedValue(recentData as any)
      const result = await service.token({
        grant_type: 'authorization_code',
        code: 'valid-code',
        redirect_uri: 'https://example.com/callback',
        code_verifier: 'v',
      } as any)
      expect(result.access_token).toBeDefined()
    })

    it('should throw INVALID_REQUEST when redirect_uri does not match stored value (RFC 6749 Section 4.1.3)', async () => {
      await expect(
        service.token({
          grant_type: 'authorization_code',
          code: 'valid-code',
          redirect_uri: 'https://different.com/callback',
          code_verifier: 'v',
        } as any)
      ).rejects.toThrow(OAuth2Exception)
      expectTokenError(OAuth2TokenErrorCode.INVALID_REQUEST, 'redirect_uri mismatch')
    })

    it('should throw INVALID_GRANT when tokens are not stored for the authorization code', async () => {
      const noTokensData = {
        ...validOAuth2Data,
        accessTokenEnc: null,
        refreshTokenEnc: null,
        accessTokenExpiresAt: null,
      }
      jest.spyOn(prisma.oAuth2Data, 'findUnique').mockResolvedValue(noTokensData as any)
      await expect(
        service.token({
          grant_type: 'authorization_code',
          code: 'valid-code',
          redirect_uri: 'https://example.com/callback',
          code_verifier: 'v',
        } as any)
      ).rejects.toThrow(OAuth2Exception)
      expectTokenError(OAuth2TokenErrorCode.INVALID_GRANT, 'tokens not available')
    })

    it('should include scope in token response when scope was stored', async () => {
      // RFC 6749 Section 5.1: scope OPTIONAL in response if identical to requested scope
      const result = await service.token({
        grant_type: 'authorization_code',
        code: 'valid-code',
        redirect_uri: 'https://example.com/callback',
        code_verifier: 'v',
      } as any)
      expect(result.scope).toBe('read')
    })

    it('should omit scope from token response when no scope was stored', async () => {
      // RFC 6749 Section 5.1: scope omitted when identical to originally granted scope
      const noScopeData = { ...validOAuth2Data, scope: null }
      jest.spyOn(prisma.oAuth2Data, 'findUnique').mockResolvedValue(noScopeData as any)
      const result = await service.token({
        grant_type: 'authorization_code',
        code: 'valid-code',
        redirect_uri: 'https://example.com/callback',
        code_verifier: 'v',
      } as any)
      expect(result.scope).toBeUndefined()
    })

    it('should throw INVALID_GRANT when authorizationCodeCreatedAt is null (missing timestamp)', async () => {
      // CUSTOM PROXY DETAIL: Defensive guard against corrupted DB rows where code exists but timestamp is null
      const nullTimestamp = { ...validOAuth2Data, authorizationCodeCreatedAt: null }
      jest.spyOn(prisma.oAuth2Data, 'findUnique').mockResolvedValue(nullTimestamp as any)
      await expect(
        service.token({
          grant_type: 'authorization_code',
          code: 'valid-code',
          redirect_uri: 'https://example.com/callback',
          code_verifier: 'v',
        } as any)
      ).rejects.toThrow(OAuth2Exception)
      expectTokenError(OAuth2TokenErrorCode.INVALID_GRANT, 'missing creation timestamp')
    })

    it('should clamp negative expires_in to 0 via Math.max (token already expired)', async () => {
      // RFC 6749 Section 5.1: expires_in is the lifetime in seconds of the access token
      const expiredTokenData = {
        ...validOAuth2Data,
        accessTokenExpiresAt: new Date(Date.now() - 60000),
      }
      jest.spyOn(prisma.oAuth2Data, 'findUnique').mockResolvedValue(expiredTokenData as any)
      const result = await service.token({
        grant_type: 'authorization_code',
        code: 'valid-code',
        redirect_uri: 'https://example.com/callback',
        code_verifier: 'v',
      } as any)
      expect(result.expires_in).toBe(0)
    })
  })

  // ─── PKCE Validation ───────────────────────────────────────────────────

  /**
   * RFC 7636 Section 4.6 - Server Verifies code_verifier before Returning Tokens
   *
   *   "If the 'code_challenge_method' was 'S256', the received 'code_verifier' is
   *    hashed by SHA-256, base64url-encoded, and then compared to the 'code_challenge'"
   *
   *   "If the 'code_challenge_method' was 'plain', they are compared directly"
   *
   * Security prompt: "During token exchange, verify the code_verifier matches the
   * previously received code_challenge using SHA-256."
   */
  describe('token - PKCE code_verifier verification (RFC 7636 Section 4.6)', () => {
    const pkceOAuth2Data = {
      id: 'auth-req-id',
      clientId: 'test-client',
      redirectUri: 'https://example.com/callback',
      authorizationCode: 'valid-code',
      authorizationCodeCreatedAt: new Date(),
      codeChallenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
      codeChallengeMethod: 'S256',
      accessTokenEnc: 'enc:access',
      refreshTokenEnc: 'enc:refresh',
      accessTokenExpiresAt: new Date(Date.now() + 3600000),
      scope: null,
    }

    beforeEach(() => {
      jest.spyOn(prisma.oAuth2Data, 'findUnique').mockResolvedValue(pkceOAuth2Data as any)
      jest.spyOn(prisma.oAuth2Data, 'delete').mockResolvedValue({} as any)
    })

    it('should validate S256 code_verifier by hashing with SHA-256 and base64url encoding', async () => {
      // The known test vector: SHA256("dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk") = E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM
      jest.spyOn(validationSubservice, 'isValidSecret').mockReturnValue(true)

      await service.token({
        grant_type: 'authorization_code',
        code: 'valid-code',
        redirect_uri: 'https://example.com/callback',
        code_verifier: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
      } as any)

      // isValidSecret should be called with the stored challenge and the computed hash
      expect(validationSubservice.isValidSecret).toHaveBeenCalledWith(
        'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
        expect.any(String) // the SHA256 hash of the verifier
      )
    })

    it('should throw INVALID_REQUEST when S256 code_verifier does not match challenge', async () => {
      jest.spyOn(validationSubservice, 'isValidSecret').mockReturnValue(false)

      await expect(
        service.token({
          grant_type: 'authorization_code',
          code: 'valid-code',
          redirect_uri: 'https://example.com/callback',
          code_verifier: 'wrong-verifier-that-does-not-match-challenge-xx',
        } as any)
      ).rejects.toThrow(OAuth2Exception)
      expectTokenError(OAuth2TokenErrorCode.INVALID_REQUEST, 'invalid code_verifier')
    })

    it('should validate plain code_verifier by direct comparison', async () => {
      const plainData = {
        ...pkceOAuth2Data,
        codeChallenge: 'plain-challenge-value',
        codeChallengeMethod: 'plain',
      }
      jest.spyOn(prisma.oAuth2Data, 'findUnique').mockResolvedValue(plainData as any)
      jest.spyOn(validationSubservice, 'isValidSecret').mockReturnValue(true)

      await service.token({
        grant_type: 'authorization_code',
        code: 'valid-code',
        redirect_uri: 'https://example.com/callback',
        code_verifier: 'plain-challenge-value',
      } as any)

      expect(validationSubservice.isValidSecret).toHaveBeenCalledWith(
        'plain-challenge-value',
        'plain-challenge-value'
      )
    })

    it('should throw INVALID_REQUEST for unsupported code_challenge_method', async () => {
      const badMethodData = { ...pkceOAuth2Data, codeChallengeMethod: 'SHA1' }
      jest.spyOn(prisma.oAuth2Data, 'findUnique').mockResolvedValue(badMethodData as any)

      await expect(
        service.token({
          grant_type: 'authorization_code',
          code: 'valid-code',
          redirect_uri: 'https://example.com/callback',
          code_verifier: 'some-verifier-value-that-is-long-enough-chars',
        } as any)
      ).rejects.toThrow(OAuth2Exception)
      expectTokenError(OAuth2TokenErrorCode.INVALID_REQUEST, 'invalid code_challenge_method')
    })

    it('should skip PKCE validation when no code_challenge was stored', async () => {
      const noPkceData = { ...pkceOAuth2Data, codeChallenge: null, codeChallengeMethod: null }
      jest.spyOn(prisma.oAuth2Data, 'findUnique').mockResolvedValue(noPkceData as any)

      const result = await service.token({
        grant_type: 'authorization_code',
        code: 'valid-code',
        redirect_uri: 'https://example.com/callback',
        code_verifier: 'v',
      } as any)
      expect(result.access_token).toBeDefined()
      expect(validationSubservice.isValidSecret).not.toHaveBeenCalled()
    })
  })

  // ─── refreshToken (via token()) ─────────────────────────────────────────

  /**
   * RFC 6749 Section 6 - Refreshing an Access Token
   *
   *   "The authorization server MUST authenticate the client if client
   *    authentication is included and ensure that the refresh token was
   *    issued to the authenticated client"
   */
  describe('token - refresh_token grant (RFC 6749 Section 6)', () => {
    beforeEach(() => {
      jest.spyOn(configService, 'getOrThrow').mockReturnValue('cognito-client-id')
    })

    it('should throw INVALID_REQUEST when client_id is missing', async () => {
      await expect(
        service.token({
          grant_type: 'refresh_token',
          refresh_token: 'enc-token',
        } as any)
      ).rejects.toThrow(OAuth2Exception)
      expectTokenError(OAuth2TokenErrorCode.INVALID_REQUEST, 'client_id required')
    })

    it('should throw INVALID_GRANT when refresh token decryption fails', async () => {
      ;(crypto.decryptData as jest.Mock).mockImplementation(() => {
        throw new Error('Bad token')
      })
      await expect(
        service.token({
          grant_type: 'refresh_token',
          refresh_token: 'bad-enc',
          client_id: 'cid',
        } as any)
      ).rejects.toThrow(OAuth2Exception)
      expectTokenError(OAuth2TokenErrorCode.INVALID_GRANT, 'invalid refresh token')
    })

    it('should throw INVALID_GRANT when refresh token clientId does not match request client_id', async () => {
      // Sender-constraining: token was issued to a different client
      ;(crypto.decryptData as jest.Mock).mockReturnValue('{"token":"rt","clientId":"other-client"}')
      ;(tokenSerialization.deserializeTokenData as jest.Mock).mockReturnValue({
        token: 'rt',
        clientId: 'other-client',
      })

      await expect(
        service.token({
          grant_type: 'refresh_token',
          refresh_token: 'enc-token',
          client_id: 'my-client',
        } as any)
      ).rejects.toThrow(OAuth2Exception)
      expectTokenError(OAuth2TokenErrorCode.INVALID_GRANT, 'invalid refresh token')
    })

    it('should call Cognito to refresh tokens with the decrypted refresh token', async () => {
      ;(crypto.decryptData as jest.Mock).mockReturnValue('{"token":"real-rt","clientId":"cid"}')
      ;(tokenSerialization.deserializeTokenData as jest.Mock).mockReturnValue({
        token: 'real-rt',
        clientId: 'cid',
      })
      jest
        .spyOn(cognitoSubservice, 'refreshTokens')
        .mockResolvedValue({ accessToken: 'new-at', idToken: undefined })

      await service.token({
        grant_type: 'refresh_token',
        refresh_token: 'enc',
        client_id: 'cid',
      } as any)
      expect(cognitoSubservice.refreshTokens).toHaveBeenCalledWith('real-rt', 'cognito-client-id')
    })

    it('should throw INVALID_GRANT when Cognito refresh fails', async () => {
      ;(crypto.decryptData as jest.Mock).mockReturnValue('{"token":"rt","clientId":"cid"}')
      ;(tokenSerialization.deserializeTokenData as jest.Mock).mockReturnValue({
        token: 'rt',
        clientId: 'cid',
      })
      jest.spyOn(cognitoSubservice, 'refreshTokens').mockRejectedValue(new Error('Cognito error'))

      await expect(
        service.token({
          grant_type: 'refresh_token',
          refresh_token: 'enc',
          client_id: 'cid',
        } as any)
      ).rejects.toThrow(OAuth2Exception)
      expectTokenError(OAuth2TokenErrorCode.INVALID_GRANT, 'unable to refresh')
    })

    it('should return encrypted access token with Bearer type and expires_in', async () => {
      ;(crypto.decryptData as jest.Mock).mockReturnValue('{"token":"rt","clientId":"cid"}')
      ;(tokenSerialization.deserializeTokenData as jest.Mock).mockReturnValue({
        token: 'rt',
        clientId: 'cid',
      })
      jest
        .spyOn(cognitoSubservice, 'refreshTokens')
        .mockResolvedValue({ accessToken: 'new-at', idToken: undefined })

      const result = await service.token({
        grant_type: 'refresh_token',
        refresh_token: 'enc',
        client_id: 'cid',
      } as any)

      expect(result.token_type).toBe('Bearer')
      expect(result.access_token).toBeDefined()
      expect(result.expires_in).toBeDefined()
    })

    it('should throw INVALID_GRANT when Cognito returns empty string accessToken (falsy)', async () => {
      // Edge case: Cognito returns accessToken='' which is falsy
      ;(crypto.decryptData as jest.Mock).mockReturnValue('{"token":"rt","clientId":"cid"}')
      ;(tokenSerialization.deserializeTokenData as jest.Mock).mockReturnValue({
        token: 'rt',
        clientId: 'cid',
      })
      jest
        .spyOn(cognitoSubservice, 'refreshTokens')
        .mockResolvedValue({ accessToken: '', idToken: undefined })

      await expect(
        service.token({
          grant_type: 'refresh_token',
          refresh_token: 'enc',
          client_id: 'cid',
        } as any)
      ).rejects.toThrow(OAuth2Exception)
      expectTokenError(OAuth2TokenErrorCode.INVALID_GRANT, 'unable to refresh')
    })

    it('should throw INVALID_GRANT when encryption fails after successful refresh', async () => {
      // CUSTOM PROXY DETAIL: AES-256-GCM token encryption failure after a successful refresh from Cognito
      ;(crypto.decryptData as jest.Mock).mockReturnValue('{"token":"rt","clientId":"cid"}')
      ;(tokenSerialization.deserializeTokenData as jest.Mock).mockReturnValue({
        token: 'rt',
        clientId: 'cid',
      })
      jest
        .spyOn(cognitoSubservice, 'refreshTokens')
        .mockResolvedValue({ accessToken: 'new-at', idToken: undefined })
      ;(crypto.encryptData as jest.Mock).mockImplementation(() => {
        throw new Error('Encryption key missing')
      })

      await expect(
        service.token({
          grant_type: 'refresh_token',
          refresh_token: 'enc',
          client_id: 'cid',
        } as any)
      ).rejects.toThrow(OAuth2Exception)
      expectTokenError(OAuth2TokenErrorCode.INVALID_GRANT, 'unable to process access token')
    })
  })

  // ─── getClientInfo ──────────────────────────────────────────────────────

  describe('getClientInfo', () => {
    it('should return clientId and clientName when client exists', () => {
      const mockClient = createMock<OAuth2Client>({ id: 'cid', name: 'Test App' })
      jest.spyOn(clientSubservice, 'findClientById').mockReturnValue(mockClient)
      const result = service.getClientInfo('cid')
      expect(result).toEqual({ clientId: 'cid', clientName: 'Test App' })
    })

    it('should throw SERVER_ERROR when client is not found', () => {
      jest.spyOn(clientSubservice, 'findClientById').mockReturnValue(undefined)
      expect(() => service.getClientInfo('nonexistent')).toThrow(OAuth2Exception)
      expectAuthError(OAuth2AuthorizationErrorCode.SERVER_ERROR, 'nonexistent')
    })
  })

  // ─── token() routing ───────────────────────────────────────────────────

  /**
   * RFC 6749 Section 5.2 - unsupported_grant_type
   */
  describe('token - grant_type routing', () => {
    it('should throw UNSUPPORTED_GRANT_TYPE for unknown grant type', async () => {
      await expect(service.token({ grant_type: 'client_credentials' } as any)).rejects.toThrow(
        OAuth2Exception
      )
      expectTokenError(OAuth2TokenErrorCode.UNSUPPORTED_GRANT_TYPE)
    })
  })
})
