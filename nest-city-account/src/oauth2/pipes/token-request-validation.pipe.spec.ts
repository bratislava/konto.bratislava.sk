import { createMock } from '@golevelup/ts-jest'
import { HttpStatus } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { OAuth2TokenErrorCode } from '../oauth2.error.enum'
import { OAuth2Exception } from '../oauth2.exception'
import { OAuth2ErrorThrower } from '../oauth2-error.thrower'
import { TokenRequestValidationPipe } from './token-request-validation.pipe'

describe('TokenRequestValidationPipe', () => {
  let pipe: TokenRequestValidationPipe
  let oAuth2ErrorThrower: OAuth2ErrorThrower

  const metadata = { type: 'body', metatype: Object, data: '' } as any

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenRequestValidationPipe,
        { provide: OAuth2ErrorThrower, useValue: createMock<OAuth2ErrorThrower>() },
      ],
    }).compile()

    pipe = module.get<TokenRequestValidationPipe>(TokenRequestValidationPipe)
    oAuth2ErrorThrower = module.get<OAuth2ErrorThrower>(OAuth2ErrorThrower)

    jest
      .spyOn(oAuth2ErrorThrower, 'tokenException')
      .mockImplementation(
        (errorCode, errorDescription) =>
          new OAuth2Exception(
            { error: errorCode, error_description: errorDescription },
            HttpStatus.BAD_REQUEST
          )
      )
  })

  it('should be defined', () => {
    expect(pipe).toBeDefined()
  })

  /**
   * Grant Type Discriminated Validation
   *
   * RFC 6749 Section 4.1.3 - authorization_code grant parameters
   * RFC 6749 Section 6 - refresh_token grant parameters
   * RFC 6749 Section 5.2 - unsupported_grant_type error
   *
   * The pipe selects the appropriate DTO class based on grant_type
   * and validates the request body against it.
   */
  describe('transform - grant_type routing', () => {
    it('should throw UNSUPPORTED_GRANT_TYPE when grant_type is missing', async () => {
      // RFC 6749 Section 4.1.3: grant_type is REQUIRED
      await expect(pipe.transform({}, metadata)).rejects.toThrow(OAuth2Exception)
      const callArgs = jest.mocked(oAuth2ErrorThrower).tokenException.mock.calls[0]
      expect(callArgs?.[0]).toBe(OAuth2TokenErrorCode.UNSUPPORTED_GRANT_TYPE)
      expect(callArgs?.[1]).toContain('grant_type missing')
    })

    it('should throw UNSUPPORTED_GRANT_TYPE for unknown grant_type', async () => {
      // RFC 6749 Section 5.2: "The authorization grant type is not supported"
      await expect(pipe.transform({ grant_type: 'client_credentials' }, metadata)).rejects.toThrow(
        OAuth2Exception
      )
      const callArgs = jest.mocked(oAuth2ErrorThrower).tokenException.mock.calls[0]
      expect(callArgs?.[0]).toBe(OAuth2TokenErrorCode.UNSUPPORTED_GRANT_TYPE)
    })

    it('should throw UNSUPPORTED_GRANT_TYPE when value is not an object', async () => {
      await expect(pipe.transform('not-an-object', metadata)).rejects.toThrow(OAuth2Exception)
      const callArgs = jest.mocked(oAuth2ErrorThrower).tokenException.mock.calls[0]
      expect(callArgs?.[0]).toBe(OAuth2TokenErrorCode.UNSUPPORTED_GRANT_TYPE)
    })

    it('should throw UNSUPPORTED_GRANT_TYPE when value is null', async () => {
      await expect(pipe.transform(null, metadata)).rejects.toThrow(OAuth2Exception)
      const callArgs = jest.mocked(oAuth2ErrorThrower).tokenException.mock.calls[0]
      expect(callArgs?.[0]).toBe(OAuth2TokenErrorCode.UNSUPPORTED_GRANT_TYPE)
    })
  })

  /**
   * authorization_code Grant Validation
   *
   * RFC 6749 Section 4.1.3 - Required: grant_type, code, redirect_uri
   * RFC 7636 Section 4.5 - Required: code_verifier (when PKCE used)
   */
  describe('transform - authorization_code validation', () => {
    it('should accept a valid authorization_code request with all required fields', async () => {
      // RFC 6749 Section 4.1.3 + RFC 7636 Section 4.5
      const result = await pipe.transform(
        {
          grant_type: 'authorization_code',
          code: 'auth-code-xyz',
          redirect_uri: 'https://example.com/callback',
          code_verifier: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
        },
        metadata
      )

      expect(result).toBeDefined()
      expect(result.grant_type).toBe('authorization_code')
    })

    it('should throw INVALID_REQUEST when required code field is missing', async () => {
      // RFC 6749 Section 4.1.3: code is REQUIRED
      await expect(
        pipe.transform(
          {
            grant_type: 'authorization_code',
            redirect_uri: 'https://example.com/callback',
            code_verifier: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
          },
          metadata
        )
      ).rejects.toThrow(OAuth2Exception)
      const callArgs = jest.mocked(oAuth2ErrorThrower).tokenException.mock.calls[0]
      expect(callArgs?.[0]).toBe(OAuth2TokenErrorCode.INVALID_REQUEST)
    })

    it('should throw INVALID_REQUEST when code_verifier has invalid format', async () => {
      // RFC 7636 Section 4.1: code_verifier MUST be 43-128 chars using unreserved characters [A-Za-z0-9-._~]
      await expect(
        pipe.transform(
          {
            grant_type: 'authorization_code',
            code: 'auth-code-xyz',
            redirect_uri: 'https://example.com/callback',
            code_verifier: 'too-short',
          },
          metadata
        )
      ).rejects.toThrow(OAuth2Exception)
      const callArgs = jest.mocked(oAuth2ErrorThrower).tokenException.mock.calls[0]
      expect(callArgs?.[0]).toBe(OAuth2TokenErrorCode.INVALID_REQUEST)
    })
  })

  /**
   * refresh_token Grant Validation
   *
   * RFC 6749 Section 6 - Required: grant_type, refresh_token
   */
  describe('transform - refresh_token validation', () => {
    it('should accept a valid refresh_token request', async () => {
      // RFC 6749 Section 6: grant_type and refresh_token REQUIRED
      const result = await pipe.transform(
        {
          grant_type: 'refresh_token',
          refresh_token: 'encrypted-refresh-token',
        },
        metadata
      )

      expect(result).toBeDefined()
      expect(result.grant_type).toBe('refresh_token')
    })

    it('should throw INVALID_REQUEST when refresh_token field is missing', async () => {
      // RFC 6749 Section 6: refresh_token is REQUIRED
      await expect(
        pipe.transform(
          {
            grant_type: 'refresh_token',
          },
          metadata
        )
      ).rejects.toThrow(OAuth2Exception)
      const callArgs = jest.mocked(oAuth2ErrorThrower).tokenException.mock.calls[0]
      expect(callArgs?.[0]).toBe(OAuth2TokenErrorCode.INVALID_REQUEST)
    })
  })

  /**
   * Validated Object Return
   *
   * The pipe transforms the plain object into a class instance
   * using class-transformer before validation.
   */
  describe('transform - return value', () => {
    it('should return a class instance, not the raw input object', async () => {
      const input = {
        grant_type: 'authorization_code',
        code: 'auth-code-xyz',
        redirect_uri: 'https://example.com/callback',
        code_verifier: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
      }
      const result = await pipe.transform(input, metadata)
      // plainToInstance creates a new object
      expect(result).not.toBe(input)
    })

    it('should strip extra properties via whitelist: true', async () => {
      // CUSTOM PROXY DETAIL: class-validator whitelist removes unknown properties.
      // RFC 6749 Section 3.2 says servers "MUST ignore unrecognized request parameters" —
      // stripping them via whitelist achieves that contract.
      const result = (await pipe.transform(
        {
          grant_type: 'refresh_token',
          refresh_token: 'enc-token',
          unknown_property: 'should-be-stripped',
        },
        metadata
      )) as any
      expect(result.unknown_property).toBeUndefined()
      expect(result.grant_type).toBe('refresh_token')
    })
  })
})
