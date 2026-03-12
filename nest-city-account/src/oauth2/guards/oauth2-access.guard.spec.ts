import { createMock } from '@golevelup/ts-jest'
import { ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import * as crypto from '../../utils/crypto'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import * as tokenSerialization from '../../utils/tokenSerialization'
import { OAuth2Client, OAuth2ClientSubservice } from '../subservices/oauth2-client.subservice'
import { OAuth2AccessGuard } from './oauth2-access.guard'

// Mock the AuthGuard base class so we don't need Passport infrastructure
jest.mock('@nestjs/passport', () => ({
  AuthGuard: () => {
    class MockAuthGuard {
      canActivate() {
        return true
      }
      handleRequest(_err: any, user: any) {
        return user
      }
    }
    return MockAuthGuard
  },
}))

describe('OAuth2AccessGuard', () => {
  let guard: OAuth2AccessGuard
  let reflector: Reflector
  let throwerErrorGuard: ThrowerErrorGuard
  let clientSubservice: OAuth2ClientSubservice

  const mockClient = createMock<OAuth2Client>({ id: 'test-client-id', name: 'TEST' })

  function createMockContext(
    overrides: {
      headers?: Record<string, string>
      clientName?: string
    } = {}
  ): ExecutionContext {
    const request = { headers: overrides.headers ?? {} }
    const context = createMock<ExecutionContext>({
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: () => request,
        getResponse: () => ({}),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    })
    return context
  }

  beforeEach(() => {
    jest.clearAllMocks()
    reflector = createMock<Reflector>()
    throwerErrorGuard = createMock<ThrowerErrorGuard>()
    clientSubservice = createMock<OAuth2ClientSubservice>()

    guard = new OAuth2AccessGuard(reflector, throwerErrorGuard, clientSubservice)

    // Default: reflector returns client name, client lookup succeeds
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue('TEST')
    jest.spyOn(clientSubservice, 'findClientByName').mockReturnValue(mockClient)

    // Make throwerErrorGuard throw real errors
    jest.spyOn(throwerErrorGuard, 'UnauthorizedException').mockImplementation(((...args: any[]) => {
      throw new Error(args[2] ?? args[1])
    }) as any)
  })

  it('should be defined', () => {
    expect(guard).toBeDefined()
  })

  /**
   * Client Name Resolution via @ClientName() Decorator
   *
   * CUSTOM PROXY DETAIL: Uses NestJS Reflector to read the expected client name
   * from the @ClientName() decorator on the endpoint. This enables per-endpoint
   * client isolation — a token issued for client A cannot access endpoints
   * decorated with @ClientName('B'). The isolation goal is RFC-aligned (RFC 6819
   * Section 5.1.5.3 / 9700 sender-constraining), but the decorator mechanism is ours.
   */
  describe('canActivate - client name resolution', () => {
    it('should throw Unauthorized when @ClientName() decorator is missing', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined)
      const context = createMockContext({ headers: { authorization: 'Bearer enc-token' } })
      await expect(guard.canActivate(context)).rejects.toThrow('Client name not specified')
    })

    it('should throw Unauthorized when client configuration not found for name', async () => {
      jest.spyOn(clientSubservice, 'findClientByName').mockReturnValue(undefined)
      const context = createMockContext({ headers: { authorization: 'Bearer enc-token' } })
      await expect(guard.canActivate(context)).rejects.toThrow('Client configuration not found')
    })

    it('should throw Unauthorized when @ClientName() decorator returns empty string (falsy)', async () => {
      // CUSTOM PROXY DETAIL: Empty string clientName is treated as missing
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue('')
      const context = createMockContext({ headers: { authorization: 'Bearer enc-token' } })
      await expect(guard.canActivate(context)).rejects.toThrow('Client name not specified')
    })
  })

  /**
   * Bearer Token Extraction
   *
   * RFC 6750 Section 2.1 - Authorization Request Header Field
   * https://datatracker.ietf.org/doc/html/rfc6750#section-2.1
   *
   *   "Clients SHOULD make authenticated requests with a bearer token using
   *    the 'Authorization' request header field with the 'Bearer' HTTP
   *    authorization scheme."
   *
   *   "Resource servers MUST support this method."
   */
  describe('canActivate - Bearer token extraction (RFC 6750 Section 2.1)', () => {
    it('should throw Unauthorized when Authorization header is missing', async () => {
      // RFC 6750 Section 2.1: Resource servers MUST support Bearer token in Authorization header
      const context = createMockContext({ headers: {} })
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Missing or invalid Authorization header'
      )
    })

    it('should throw Unauthorized when Authorization header does not start with "Bearer "', async () => {
      // RFC 6750 Section 2.1: MUST use "Bearer" HTTP authorization scheme
      const context = createMockContext({ headers: { authorization: 'Basic abc123' } })
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Missing or invalid Authorization header'
      )
    })

    it('should throw Unauthorized when token after "Bearer " prefix is empty', async () => {
      // RFC 6750 Section 2.1: Token value after "Bearer " must be non-empty
      jest.spyOn(crypto, 'decryptData').mockImplementation(() => {
        throw new Error('empty input')
      })
      const context = createMockContext({ headers: { authorization: 'Bearer ' } })
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Failed to decrypt or deserialize token'
      )
    })

    it('should extract encrypted token from after "Bearer " prefix', async () => {
      // RFC 6750 Section 2.1: Extract b64token value following "Bearer " scheme
      const decryptSpy = jest
        .spyOn(crypto, 'decryptData')
        .mockReturnValue('{"token":"jwt","clientId":"test-client-id"}')
      jest
        .spyOn(tokenSerialization, 'deserializeTokenData')
        .mockReturnValue({ token: 'jwt', clientId: 'test-client-id' })

      const context = createMockContext({
        headers: { authorization: 'Bearer encrypted-token-value' },
      })
      await guard.canActivate(context)

      expect(decryptSpy).toHaveBeenCalledWith('encrypted-token-value')
    })
  })

  /**
   * Token Decryption and Deserialization
   *
   * CUSTOM PROXY DETAIL: Tokens are encrypted with AES-256-GCM before being sent to clients.
   * The guard decrypts and deserializes the token to extract the plain JWT and clientId.
   * The on-the-wire format is opaque to clients (which is RFC 6749 Section 1.4 compliant —
   * "tokens MAY have different formats"); the AES wrapping is our proxy's choice.
   */
  describe('canActivate - token decryption', () => {
    it('should throw Unauthorized when token decryption fails', async () => {
      jest.spyOn(crypto, 'decryptData').mockImplementation(() => {
        throw new Error('Decryption failed')
      })
      const context = createMockContext({ headers: { authorization: 'Bearer bad-token' } })
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Failed to decrypt or deserialize token'
      )
    })

    it('should throw Unauthorized when token deserialization fails', async () => {
      jest.spyOn(crypto, 'decryptData').mockReturnValue('not-valid-json')
      jest.spyOn(tokenSerialization, 'deserializeTokenData').mockImplementation(() => {
        throw new Error('Invalid JSON')
      })
      const context = createMockContext({ headers: { authorization: 'Bearer bad-token' } })
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Failed to decrypt or deserialize token'
      )
    })

    it('should replace Authorization header with decrypted plain JWT for Passport', async () => {
      jest.spyOn(crypto, 'decryptData').mockReturnValue('serialized')
      jest
        .spyOn(tokenSerialization, 'deserializeTokenData')
        .mockReturnValue({ token: 'plain-jwt-token', clientId: 'test-client-id' })

      const context = createMockContext({ headers: { authorization: 'Bearer encrypted-token' } })
      const request = context.switchToHttp().getRequest()
      await guard.canActivate(context)

      // The guard replaces the encrypted token with the plain JWT before Passport processes it
      expect(request.headers.authorization).toBe('Bearer plain-jwt-token')
    })
  })

  /**
   * Client ID Isolation (Sender-Constraining)
   *
   * CUSTOM PROXY DETAIL: Tokens include the clientId they were issued for. The guard
   * validates that the token's clientId matches the expected client for the endpoint.
   * This prevents cross-client token usage.
   *
   * The mechanism is custom (clientId baked into the encrypted token wrapper), but the
   * goal aligns with RFC 8705/9449 sender-constraining and RFC 6819 Section 5.1.5.3
   * ("Bind tokens to client").
   */
  describe('canActivate - client ID isolation', () => {
    it('should throw Unauthorized when token clientId does not match expected client', async () => {
      jest.spyOn(crypto, 'decryptData').mockReturnValue('serialized')
      jest
        .spyOn(tokenSerialization, 'deserializeTokenData')
        .mockReturnValue({ token: 'jwt', clientId: 'different-client-id' })

      const context = createMockContext({ headers: { authorization: 'Bearer token' } })
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Token client ID does not match expected client ID'
      )
    })

    it('should pass when token clientId matches expected client', async () => {
      jest.spyOn(crypto, 'decryptData').mockReturnValue('serialized')
      jest
        .spyOn(tokenSerialization, 'deserializeTokenData')
        .mockReturnValue({ token: 'jwt', clientId: 'test-client-id' })

      const context = createMockContext({ headers: { authorization: 'Bearer token' } })
      const result = await guard.canActivate(context)
      expect(result).toBe(true)
    })
  })

  /**
   * handleRequest - Passport Error Handling
   *
   * RFC 6750 Section 3.1 - Error Codes
   * https://datatracker.ietf.org/doc/html/rfc6750#section-3.1
   *
   *   "invalid_token: The access token provided is expired, revoked,
   *    malformed, or invalid for other reasons."
   */
  describe('handleRequest - Passport error handling (RFC 6750 Section 3.1)', () => {
    it('should throw Unauthorized when Passport returns an error', () => {
      const context = createMock<ExecutionContext>()
      const error = new Error('Token expired')
      expect(() => guard.handleRequest(error, null, { message: 'jwt expired' }, context)).toThrow(
        'Failed to verify token'
      )
    })

    it('should throw Unauthorized when Passport returns no user', () => {
      const context = createMock<ExecutionContext>()
      expect(() => guard.handleRequest(null, null, { message: 'No user' }, context)).toThrow(
        'User not found'
      )
    })

    it('should return user data when Passport succeeds', () => {
      const context = createMock<ExecutionContext>()
      const user = { sub: 'user-123', email: 'test@example.com' }
      const result = guard.handleRequest(null, user as any, null, context)
      expect(result).toBe(user)
    })
  })
})
