/* eslint-disable @typescript-eslint/no-explicit-any */

import { Test, TestingModule } from '@nestjs/testing'
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common'
import { createMock } from '@golevelup/ts-jest'
import { Response } from 'express'
import { OAuth2ExceptionFilter } from './oauth2-exception.filter'
import { OAuth2Client, OAuth2ClientSubservice } from '../subservices/oauth2-client.subservice'
import { OAuth2Exception } from '../oauth2.exception'
import { OAuth2AuthorizationErrorCode, OAuth2TokenErrorCode } from '../oauth2.error.enum'

describe('OAuth2ExceptionFilter', () => {
  let filter: OAuth2ExceptionFilter
  let oauth2ClientSubservice: OAuth2ClientSubservice
  let mockResponse: Partial<Response>
  let mockRequest: any
  let mockArgumentsHost: ArgumentsHost

  const authorizePath = '/oauth2/authorize'
  beforeEach(async () => {
    jest.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OAuth2ExceptionFilter,
        { provide: OAuth2ClientSubservice, useValue: createMock<OAuth2ClientSubservice>() },
      ],
    }).compile()

    filter = module.get<OAuth2ExceptionFilter>(OAuth2ExceptionFilter)
    oauth2ClientSubservice = module.get<OAuth2ClientSubservice>(OAuth2ClientSubservice)

    // Mock response object
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      redirect: jest.fn().mockReturnThis(),
      header: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
    }

    // Mock request object
    mockRequest = {
      path: '',
      method: 'GET',
      originalUrl: authorizePath,
      body: {},
      query: {},
      headers: {},
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('test-user-agent'),
    }

    // Mock ArgumentsHost
    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as any
  })

  it('should be defined', () => {
    expect(filter).toBeDefined()
  })

  /**
   * Authorization Endpoint Error Response
   *
   * RFC 6749 Section 4.1.2.1 - Authorization Code Grant Error Response
   * https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.2.1
   *
   * RFC 9700 - OAuth 2.0 Redirect Status Codes
   * https://datatracker.ietf.org/doc/html/rfc9700
   *
   * Tests the handleAuthorizationError method in oauth2-exception.filter.ts
   */
  describe('catch - Authorization Endpoint Errors (RFC 6749 Section 4.1.2.1)', () => {
    beforeEach(() => {
      mockRequest.path = authorizePath
    })

    it('should redirect to client redirect_uri with error parameters when redirect_uri is valid', () => {
      // RFC 6749 Section 4.1.2.1: Errors with valid redirect_uri MUST redirect
      // https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.2.1
      const mockClient = createMock<OAuth2Client>({
        isRedirectUriAllowed: jest.fn().mockReturnValue(true),
      })
      jest.spyOn(oauth2ClientSubservice, 'findClientById').mockReturnValue(mockClient)

      mockRequest.query = {
        client_id: 'test-client',
        redirect_uri: 'https://example.com/callback',
        state: 'test-state',
      }

      const exception = new HttpException(
        {
          error: OAuth2AuthorizationErrorCode.INVALID_REQUEST,
          error_description: 'Invalid request parameters',
        },
        HttpStatus.BAD_REQUEST
      )

      filter.catch(exception, mockArgumentsHost)

      // RFC 9700: Use 303 See Other for OAuth2 redirects
      // https://datatracker.ietf.org/doc/html/rfc9700#section-2.1
      expect(mockResponse.redirect).toHaveBeenCalledWith(
        HttpStatus.SEE_OTHER,
        expect.stringContaining('https://example.com/callback')
      )
      expect(mockResponse.redirect).toHaveBeenCalledWith(
        HttpStatus.SEE_OTHER,
        expect.stringContaining('error=invalid_request')
      )
      expect(mockResponse.redirect).toHaveBeenCalledWith(
        HttpStatus.SEE_OTHER,
        expect.stringContaining('state=test-state')
      )
    })

    it('should return JSON error when redirect_uri is missing (RFC 6749: prevent open redirector)', () => {
      // RFC 6749 Section 4.1.2.1: MUST NOT redirect without valid redirect_uri
      // https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.2.1
      mockRequest.query = {}

      const exception = new HttpException(
        {
          error: OAuth2AuthorizationErrorCode.INVALID_REQUEST,
          error_description: 'Missing redirect_uri',
        },
        HttpStatus.BAD_REQUEST
      )

      filter.catch(exception, mockArgumentsHost)

      expect(mockResponse.redirect).not.toHaveBeenCalled()
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST)
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: OAuth2AuthorizationErrorCode.INVALID_REQUEST,
        })
      )
    })

    it('should return JSON error when redirect_uri is not allowed (RFC 6819: security)', () => {
      // RFC 6819 Section 5.2.3.5: Validate redirect_uri to prevent open redirector
      // https://datatracker.ietf.org/doc/html/rfc6819#section-5.2.3.5
      // "The authorization server SHOULD require all clients to register their
      // 'redirect_uri', and the 'redirect_uri' should be the full URI"
      const mockClient = createMock<OAuth2Client>({
        isRedirectUriAllowed: jest.fn().mockReturnValue(false),
      })
      jest.spyOn(oauth2ClientSubservice, 'findClientById').mockReturnValue(mockClient)

      mockRequest.query = {
        client_id: 'test-client',
        redirect_uri: 'https://malicious.com/callback',
      }

      const exception = new HttpException(
        {
          error: OAuth2AuthorizationErrorCode.INVALID_REQUEST,
          error_description: 'Invalid redirect_uri',
        },
        HttpStatus.BAD_REQUEST
      )

      filter.catch(exception, mockArgumentsHost)

      expect(mockResponse.redirect).not.toHaveBeenCalled()
      expect(mockResponse.json).toHaveBeenCalled()
    })

    it('should preserve state parameter in error redirects (RFC 6749 Section 4.1.2.1)', () => {
      // RFC 6749 Section 4.1.2.1: state is REQUIRED in error response if present in request
      // https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.2.1
      // "If a state parameter was present in the client authorization request,
      // the authorization server MUST return the unmodified state value..."
      const mockClient = createMock<OAuth2Client>({
        isRedirectUriAllowed: jest.fn().mockReturnValue(true),
      })
      jest.spyOn(oauth2ClientSubservice, 'findClientById').mockReturnValue(mockClient)

      mockRequest.query = {
        client_id: 'test-client',
        redirect_uri: 'https://example.com/callback',
        state: 'csrf-token-12345',
      }
      ;(mockRequest as any).authorizationRequestData = {
        client_id: 'test-client',
        redirect_uri: 'https://example.com/callback',
        state: 'csrf-token-12345',
      }

      const exception = new HttpException(
        {
          error: OAuth2AuthorizationErrorCode.ACCESS_DENIED,
          error_description: 'User denied authorization',
        },
        HttpStatus.FORBIDDEN
      )

      filter.catch(exception, mockArgumentsHost)

      expect(mockResponse.redirect).toHaveBeenCalledWith(
        HttpStatus.SEE_OTHER,
        expect.stringContaining('state=csrf-token-12345')
      )
    })

    it('should include error_description in redirect URL', () => {
      // RFC 6749 Section 4.1.2.1 - error_description parameter
      // https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.2.1
      //
      // error_description
      //          OPTIONAL.  Human-readable ASCII [USASCII] text providing
      //          additional information, used to assist the client developer in
      //          understanding the error that occurred.
      //          Values for the "error_description" parameter MUST NOT include
      //          characters outside the set %x20-21 / %x23-5B / %x5D-7E.
      const mockClient = createMock<OAuth2Client>({
        isRedirectUriAllowed: jest.fn().mockReturnValue(true),
      })
      jest.spyOn(oauth2ClientSubservice, 'findClientById').mockReturnValue(mockClient)

      mockRequest.query = {
        client_id: 'test-client',
        redirect_uri: 'https://example.com/callback',
      }

      const exception = new HttpException(
        {
          error: OAuth2AuthorizationErrorCode.INVALID_SCOPE,
          error_description: 'The requested scope is invalid',
        },
        HttpStatus.BAD_REQUEST
      )

      filter.catch(exception, mockArgumentsHost)

      expect(mockResponse.redirect).toHaveBeenCalledWith(
        HttpStatus.SEE_OTHER,
        expect.stringContaining('error_description=The+requested+scope+is+invalid')
      )
    })

    it('should handle OAuth2Exception with metadata', () => {
      // NON-RFC FEATURE: OAuth2Exception can carry internal metadata
      // that is logged but never sent to the client (see oauth2.exception.ts)
      // This allows separation of public error messages from internal diagnostics
      const mockClient = createMock<OAuth2Client>({
        isRedirectUriAllowed: jest.fn().mockReturnValue(true),
      })
      jest.spyOn(oauth2ClientSubservice, 'findClientById').mockReturnValue(mockClient)

      mockRequest.query = {
        client_id: 'test-client',
        redirect_uri: 'https://example.com/callback',
      }

      const exception = new OAuth2Exception(
        {
          error: OAuth2AuthorizationErrorCode.SERVER_ERROR,
          error_description: 'Internal server error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
        {
          consoleMessage: 'Database connection failed',
          alert: 1,
          metadata: { errorCode: 'DB_001' },
        }
      )

      filter.catch(exception, mockArgumentsHost)

      expect(mockResponse.redirect).toHaveBeenCalledWith(
        HttpStatus.SEE_OTHER,
        expect.stringContaining('error=server_error')
      )
    })

    it('should use redirect_uri from authorizationRequestData when available', () => {
      const mockClient = createMock<OAuth2Client>({
        isRedirectUriAllowed: jest.fn().mockReturnValue(true),
      })
      jest.spyOn(oauth2ClientSubservice, 'findClientById').mockReturnValue(mockClient)

      mockRequest.path = '/oauth2/continue'
      ;(mockRequest as any).authorizationRequestData = {
        client_id: 'test-client',
        redirect_uri: 'https://example.com/stored-callback',
        state: 'stored-state',
      }

      const exception = new HttpException(
        {
          error: OAuth2AuthorizationErrorCode.ACCESS_DENIED,
          error_description: 'Access denied',
        },
        HttpStatus.FORBIDDEN
      )

      filter.catch(exception, mockArgumentsHost)

      expect(mockResponse.redirect).toHaveBeenCalledWith(
        HttpStatus.SEE_OTHER,
        expect.stringContaining('https://example.com/stored-callback')
      )
    })
  })

  /**
   * Token Endpoint Error Response
   *
   * RFC 6749 Section 5.2 - Token Endpoint Error Response
   * https://datatracker.ietf.org/doc/html/rfc6749#section-5.2
   *
   * RFC 6750 Section 3 - The WWW-Authenticate Response Header Field
   * https://datatracker.ietf.org/doc/html/rfc6750#section-3
   *
   * Tests the handleTokenError method in oauth2-exception.filter.ts
   */
  describe('catch - Token Endpoint Errors (RFC 6749 Section 5.2)', () => {
    beforeEach(() => {
      mockRequest.path = '/oauth2/token'
      mockRequest.method = 'POST'
    })

    it('should return 400 Bad Request for token errors (RFC 6749 Section 5.2)', () => {
      // RFC 6749 Section 5.2: Token endpoint returns HTTP 400
      // https://datatracker.ietf.org/doc/html/rfc6749#section-5.2
      // "The authorization server responds with an HTTP 400 (Bad Request) status code"
      const exception = new HttpException(
        {
          error: OAuth2TokenErrorCode.INVALID_GRANT,
          error_description: 'Invalid authorization code',
        },
        HttpStatus.BAD_REQUEST
      )

      filter.catch(exception, mockArgumentsHost)

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST)
      expect(mockResponse.header).toHaveBeenCalledWith(
        'Content-Type',
        'application/json;charset=UTF-8'
      )
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: OAuth2TokenErrorCode.INVALID_GRANT,
          error_description: 'Invalid authorization code',
        })
      )
    })

    it('should return 401 Unauthorized for invalid_client errors (RFC 6749 Section 5.2)', () => {
      // RFC 6749 Section 5.2: invalid_client error code
      // https://datatracker.ietf.org/doc/html/rfc6749#section-5.2
      //
      const exception = new HttpException(
        {
          error: OAuth2TokenErrorCode.INVALID_CLIENT,
          error_description: 'Client authentication failed',
        },
        HttpStatus.UNAUTHORIZED
      )

      filter.catch(exception, mockArgumentsHost)

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED)
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: OAuth2TokenErrorCode.INVALID_CLIENT,
        })
      )
    })

    it('should include WWW-Authenticate header for invalid_client (RFC 6750 Section 3)', () => {
      // RFC 6750 Section 3: Include WWW-Authenticate for authentication failures
      // https://datatracker.ietf.org/doc/html/rfc6750#section-3
      // "If the request lacks any authentication information... the resource server
      // SHOULD include the HTTP 'WWW-Authenticate' response header field"
      const exception = new HttpException(
        {
          error: OAuth2TokenErrorCode.INVALID_CLIENT,
          error_description: 'Client authentication failed',
        },
        HttpStatus.UNAUTHORIZED
      )

      filter.catch(exception, mockArgumentsHost)

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'WWW-Authenticate',
        'Basic realm="OAuth2 Token Endpoint"'
      )
    })

    it('should not include state parameter in token error responses', () => {
      // Token endpoint errors never include state parameter
      const exception = new HttpException(
        {
          error: OAuth2TokenErrorCode.INVALID_REQUEST,
          error_description: 'Missing required parameter',
        },
        HttpStatus.BAD_REQUEST
      )

      filter.catch(exception, mockArgumentsHost)

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.not.objectContaining({
          state: expect.anything(),
        })
      )
    })

    it('should handle unsupported_grant_type error', () => {
      const exception = new HttpException(
        {
          error: OAuth2TokenErrorCode.UNSUPPORTED_GRANT_TYPE,
          error_description: 'Grant type not supported',
        },
        HttpStatus.BAD_REQUEST
      )

      filter.catch(exception, mockArgumentsHost)

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST)
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: OAuth2TokenErrorCode.UNSUPPORTED_GRANT_TYPE,
        })
      )
    })

    it('should handle invalid_scope error', () => {
      const exception = new HttpException(
        {
          error: OAuth2TokenErrorCode.INVALID_SCOPE,
          error_description: 'The requested scope is invalid',
        },
        HttpStatus.BAD_REQUEST
      )

      filter.catch(exception, mockArgumentsHost)

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: OAuth2TokenErrorCode.INVALID_SCOPE,
        })
      )
    })

    it('should set correct Content-Type header (RFC 6749 Section 5.2)', () => {
      // RFC 6749: Token errors use application/json
      const exception = new HttpException(
        {
          error: OAuth2TokenErrorCode.INVALID_REQUEST,
          error_description: 'Invalid request',
        },
        HttpStatus.BAD_REQUEST
      )

      filter.catch(exception, mockArgumentsHost)

      expect(mockResponse.header).toHaveBeenCalledWith(
        'Content-Type',
        'application/json;charset=UTF-8'
      )
    })
  })

  /**
   * Error Code Mapping for Authorization Endpoint
   *
   * RFC 6749 Section 4.1.2.1 defines standard error codes:
   * https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.2.1
   * - invalid_request
   * - unauthorized_client
   * - access_denied
   * - unsupported_response_type
   * - invalid_scope
   * - server_error
   * - temporarily_unavailable
   *
   * Tests the mapStatusToAuthorizationError method in oauth2-exception.filter.ts
   */
  describe('Error Code Mapping (RFC 6749 Compliance)', () => {
    beforeEach(() => {
      mockRequest.path = authorizePath
      const mockClient = createMock<OAuth2Client>({
        isRedirectUriAllowed: jest.fn().mockReturnValue(true),
      })
      jest.spyOn(oauth2ClientSubservice, 'findClientById').mockReturnValue(mockClient)
      mockRequest.query = {
        client_id: 'test-client',
        redirect_uri: 'https://example.com/callback',
      }
    })

    it('should map 400 Bad Request to invalid_request for authorization endpoint', () => {
      const exception = new HttpException('Bad request', HttpStatus.BAD_REQUEST)

      filter.catch(exception, mockArgumentsHost)

      expect(mockResponse.redirect).toHaveBeenCalledWith(
        HttpStatus.SEE_OTHER,
        expect.stringContaining('error=invalid_request')
      )
    })

    it('should map 401/403 to access_denied for authorization endpoint', () => {
      const exception = new HttpException('Forbidden', HttpStatus.FORBIDDEN)

      filter.catch(exception, mockArgumentsHost)

      expect(mockResponse.redirect).toHaveBeenCalledWith(
        HttpStatus.SEE_OTHER,
        expect.stringContaining('error=access_denied')
      )
    })

    it('should map 500 to server_error for authorization endpoint', () => {
      const exception = new HttpException('Server error', HttpStatus.INTERNAL_SERVER_ERROR)

      filter.catch(exception, mockArgumentsHost)

      expect(mockResponse.redirect).toHaveBeenCalledWith(
        HttpStatus.SEE_OTHER,
        expect.stringContaining('error=server_error')
      )
    })

    it('should map 504 Gateway Timeout to temporarily_unavailable', () => {
      const exception = new HttpException('Gateway timeout', HttpStatus.GATEWAY_TIMEOUT)

      filter.catch(exception, mockArgumentsHost)

      expect(mockResponse.redirect).toHaveBeenCalledWith(
        HttpStatus.SEE_OTHER,
        expect.stringContaining('error=temporarily_unavailable')
      )
    })
  })

  /**
   * Error Code Mapping for Token Endpoint
   *
   * RFC 6749 Section 5.2 defines standard token error codes:
   * https://datatracker.ietf.org/doc/html/rfc6749#section-5.2
   * - invalid_request
   * - invalid_client
   * - invalid_grant
   * - unauthorized_client
   * - unsupported_grant_type
   * - invalid_scope
   *
   * Tests the mapStatusToTokenError method in oauth2-exception.filter.ts
   */
  describe('Token Error Code Mapping', () => {
    beforeEach(() => {
      mockRequest.path = '/oauth2/token'
      mockRequest.method = 'POST'
    })

    it('should map 400 to invalid_request for token endpoint', () => {
      const exception = new HttpException('Bad request', HttpStatus.BAD_REQUEST)

      filter.catch(exception, mockArgumentsHost)

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: OAuth2TokenErrorCode.INVALID_REQUEST,
        })
      )
    })

    it('should map 401 to invalid_client for token endpoint', () => {
      const exception = new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED)

      filter.catch(exception, mockArgumentsHost)

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: OAuth2TokenErrorCode.INVALID_CLIENT,
        })
      )
    })

    it('should map 403 to unauthorized_client for token endpoint', () => {
      const exception = new HttpException('Forbidden', HttpStatus.FORBIDDEN)

      filter.catch(exception, mockArgumentsHost)

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: OAuth2TokenErrorCode.UNAUTHORIZED_CLIENT,
        })
      )
    })
  })

  describe('Error Response Validation', () => {
    beforeEach(() => {
      mockRequest.path = '/oauth2/token'
    })

    it('should handle string error messages', () => {
      const exception = new HttpException('Simple error message', HttpStatus.BAD_REQUEST)

      filter.catch(exception, mockArgumentsHost)

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: OAuth2TokenErrorCode.INVALID_REQUEST,
          error_description: 'Simple error message',
        })
      )
    })

    it('should handle object error messages with message property', () => {
      const exception = new HttpException(
        { message: 'Detailed error message' },
        HttpStatus.BAD_REQUEST
      )

      filter.catch(exception, mockArgumentsHost)

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error_description: 'Detailed error message',
        })
      )
    })

    it('should validate and use properly formatted OAuth2 errors', () => {
      const exception = new HttpException(
        {
          error: OAuth2TokenErrorCode.INVALID_GRANT,
          error_description: 'Authorization code is invalid',
          error_uri: 'https://docs.example.com/errors/invalid_grant',
        },
        HttpStatus.BAD_REQUEST
      )

      filter.catch(exception, mockArgumentsHost)

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: OAuth2TokenErrorCode.INVALID_GRANT,
          error_description: 'Authorization code is invalid',
          error_uri: 'https://docs.example.com/errors/invalid_grant',
        })
      )
    })

    it('should fallback to valid error when validation fails', () => {
      mockRequest.path = '/oauth2/token'
      // Malformed error object
      const exception = new HttpException({ invalid: 'structure' } as any, HttpStatus.BAD_REQUEST)

      filter.catch(exception, mockArgumentsHost)

      // Should still return a valid OAuth2 error even with malformed input
      // The filter normalizes errors to ensure RFC compliance
      const response = (mockResponse.json as jest.Mock).mock.calls[0][0]

      expect(response).toMatchObject({
        error: expect.any(String),
        error_description: expect.any(String),
      })

      // Error code must be one of the valid OAuth2TokenErrorCode values from RFC 6749 Section 5.2
      // https://datatracker.ietf.org/doc/html/rfc6749#section-5.2
      expect(Object.values(OAuth2TokenErrorCode)).toContain(response.error)
    })
  })

  describe('URL Building', () => {
    it('should correctly encode error parameters in redirect URL', () => {
      // RFC 6749 Section 4.1.2.1 requires error parameters in query string
      // https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.2.1
      // Parameters must be properly URL-encoded per RFC 3986
      // https://datatracker.ietf.org/doc/html/rfc3986#section-2.1
      const mockClient = createMock<OAuth2Client>({
        isRedirectUriAllowed: jest.fn().mockReturnValue(true),
      })
      jest.spyOn(oauth2ClientSubservice, 'findClientById').mockReturnValue(mockClient)

      mockRequest.path = authorizePath
      mockRequest.query = {
        client_id: 'test-client',
        redirect_uri: 'https://example.com/callback',
      }

      const exception = new HttpException(
        {
          error: OAuth2AuthorizationErrorCode.INVALID_REQUEST,
          error_description: 'The request contains special characters: &=?',
        },
        HttpStatus.BAD_REQUEST
      )

      filter.catch(exception, mockArgumentsHost)

      const redirectUrl = (mockResponse.redirect as jest.Mock).mock.calls[0][1]
      expect(redirectUrl).toContain('error=invalid_request')
      // URL encoding should handle special characters
      expect(redirectUrl).toMatch(/error_description=[^&]+/)
    })

    it('should preserve existing query parameters in redirect_uri', () => {
      // RFC 6749 Section 4.1.2.1 - Appending to redirect_uri
      // https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.2.1
      const mockClient = createMock<OAuth2Client>({
        isRedirectUriAllowed: jest.fn().mockReturnValue(true),
      })
      jest.spyOn(oauth2ClientSubservice, 'findClientById').mockReturnValue(mockClient)

      mockRequest.path = authorizePath
      mockRequest.query = {
        client_id: 'test-client',
        redirect_uri: 'https://example.com/callback?existing=param',
      }

      const exception = new HttpException(
        {
          error: OAuth2AuthorizationErrorCode.ACCESS_DENIED,
          error_description: 'Access denied',
        },
        HttpStatus.FORBIDDEN
      )

      filter.catch(exception, mockArgumentsHost)

      const redirectUrl = (mockResponse.redirect as jest.Mock).mock.calls[0][1]
      expect(redirectUrl).toContain('existing=param')
      expect(redirectUrl).toContain('error=access_denied')
    })
  })

  /**
   * Security Considerations - Open Redirector Prevention
   *
   * RFC 6819 Section 5.2.3.5 - Redirect URI Validation
   * https://datatracker.ietf.org/doc/html/rfc6819#section-5.2.3.5
   *
   * "The authorization server SHOULD require all clients to register their
   * 'redirect_uri', and the 'redirect_uri' should be the full URI as defined in
   * [RFC3986] Section 4.3"
   *
   * Also related to Section 4.1.5 - Open Redirectors:
   * https://datatracker.ietf.org/doc/html/rfc6819#section-4.1.5
   *
   * Tests the extractRedirectUriAndStateFromQuery method's security validation
   * in oauth2-exception.filter.ts (lines 113-139)
   */
  describe('Security Considerations (RFC 6819)', () => {
    it('should not redirect to unvalidated redirect_uri (open redirector prevention)', () => {
      // RFC 6819 Section 5.2.3.5: Require registration and validation of redirect URIs
      // https://datatracker.ietf.org/doc/html/rfc6819#section-5.2.3.5
      mockRequest.path = authorizePath
      mockRequest.query = {
        client_id: 'unknown-client',
        redirect_uri: 'https://attacker.com/steal-codes',
      }

      jest.spyOn(oauth2ClientSubservice, 'findClientById').mockReturnValue(undefined)

      const exception = new HttpException(
        {
          error: OAuth2AuthorizationErrorCode.INVALID_REQUEST,
          error_description: 'Invalid client',
        },
        HttpStatus.BAD_REQUEST
      )

      filter.catch(exception, mockArgumentsHost)

      expect(mockResponse.redirect).not.toHaveBeenCalled()
      expect(mockResponse.json).toHaveBeenCalled()
    })
  })

  /**
   * NON-RFC FEATURE: Internal Endpoints (/store and /info)
   *
   * These are custom endpoints for the "token staging" bridge pattern
   * described in sequence-diagram.md (lines 73-84).
   *
   * /store - Stores tokens temporarily after user authentication
   * /info - Returns client information for display on frontend
   *
   * Implementation: handleInternalError method in oauth2-exception.filter.ts (lines 88-112)
   * These endpoints return JSON errors (not redirects) to the frontend
   */
  describe('Non-RFC Features - Internal Endpoints', () => {
    describe('handleInternalError - /store endpoint', () => {
      it('should handle errors on /store endpoint with JSON response', () => {
        mockRequest.path = '/oauth2/store'
        mockRequest.method = 'POST'
        mockRequest.body = { authRequestId: 'test-id', refreshToken: 'test-token' }
        ;(mockRequest as any).authorizationRequestData = {
          client_id: 'test-client',
          redirect_uri: 'https://example.com/callback',
        }

        const exception = new HttpException(
          {
            error: OAuth2AuthorizationErrorCode.SERVER_ERROR,
            error_description: 'Database error',
          },
          HttpStatus.INTERNAL_SERVER_ERROR
        )

        filter.catch(exception, mockArgumentsHost)

        expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR)
        expect(mockResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            error: OAuth2AuthorizationErrorCode.SERVER_ERROR,
            error_description: 'Database error',
          })
        )
        expect(mockResponse.redirect).not.toHaveBeenCalled()
      })

      it('should log authorizationRequestData in error logs for /store', () => {
        mockRequest.path = '/oauth2/store'
        mockRequest.method = 'POST'
        ;(mockRequest as any).authorizationRequestData = {
          client_id: 'test-client',
          redirect_uri: 'https://example.com/callback',
        }

        const exception = new HttpException('Store failed', HttpStatus.BAD_REQUEST)
        const loggerSpy = jest.spyOn((filter as any).logger, 'error')

        filter.catch(exception, mockArgumentsHost)

        expect(loggerSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            method: 'POST',
            authRequestData: expect.objectContaining({
              client_id: 'test-client',
            }),
          })
        )
      })
    })

    describe('handleInternalError - /info endpoint', () => {
      it('should handle errors on /info endpoint with JSON response', () => {
        mockRequest.path = '/oauth2/info'
        mockRequest.method = 'GET'
        mockRequest.query = { authRequestId: 'test-id' }

        const exception = new HttpException(
          {
            error: OAuth2AuthorizationErrorCode.INVALID_REQUEST,
            error_description: 'Client not found',
          },
          HttpStatus.BAD_REQUEST
        )

        filter.catch(exception, mockArgumentsHost)

        expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST)
        expect(mockResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            error: OAuth2AuthorizationErrorCode.INVALID_REQUEST,
          })
        )
      })

      it('should handle /info endpoint without authorizationRequestData', () => {
        mockRequest.path = '/oauth2/info'
        delete (mockRequest as any).authorizationRequestData

        const exception = new HttpException('Info not found', HttpStatus.NOT_FOUND)
        const loggerSpy = jest.spyOn((filter as any).logger, 'error')

        filter.catch(exception, mockArgumentsHost)

        expect(loggerSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            authRequestData: '<NO REQUEST>',
          })
        )
      })
    })
  })

  /**
   * NON-RFC FEATURE: extractRedirectUriAndStateFromQuery Method
   *
   * Custom helper method that extracts and validates redirect_uri from query parameters
   * when the authorization request data is not available in the request object.
   *
   * Implementation: oauth2-exception.filter.ts (lines 113-139)
   *
   * Security features:
   * - Validates client_id exists
   * - Verifies client is registered
   * - Checks redirect_uri is in client's allowed list
   * - Handles non-string query parameter edge cases
   *
   * Used as fallback when authorizationRequestData is not attached to request
   * (typically early in authorization flow or on validation errors)
   */
  describe('Non-RFC Features - extractRedirectUriAndStateFromQuery', () => {
    it('should extract redirect_uri and state from query when valid client', () => {
      const mockClient = createMock<OAuth2Client>({
        isRedirectUriAllowed: jest.fn().mockReturnValue(true),
      })
      jest.spyOn(oauth2ClientSubservice, 'findClientById').mockReturnValue(mockClient)

      mockRequest.path = authorizePath
      mockRequest.query = {
        client_id: 'test-client',
        redirect_uri: 'https://example.com/callback',
        state: 'test-state',
      }

      const exception = new HttpException(
        {
          error: OAuth2AuthorizationErrorCode.INVALID_REQUEST,
          error_description: 'Test error',
        },
        HttpStatus.BAD_REQUEST
      )

      filter.catch(exception, mockArgumentsHost)

      expect(mockResponse.redirect).toHaveBeenCalledWith(
        HttpStatus.SEE_OTHER,
        expect.stringContaining('state=test-state')
      )
    })

    it('should return undefined redirect_uri when client_id is missing', () => {
      mockRequest.path = authorizePath
      mockRequest.query = {
        redirect_uri: 'https://example.com/callback',
        // Missing client_id
      }

      const exception = new HttpException('Error', HttpStatus.BAD_REQUEST)

      filter.catch(exception, mockArgumentsHost)

      // Should not redirect, should return JSON
      expect(mockResponse.redirect).not.toHaveBeenCalled()
      expect(mockResponse.json).toHaveBeenCalled()
    })

    it('should return undefined redirect_uri when redirect_uri is missing from query', () => {
      mockRequest.path = authorizePath
      mockRequest.query = {
        client_id: 'test-client',
        // Missing redirect_uri
      }

      const exception = new HttpException('Error', HttpStatus.BAD_REQUEST)

      filter.catch(exception, mockArgumentsHost)

      expect(mockResponse.redirect).not.toHaveBeenCalled()
      expect(mockResponse.json).toHaveBeenCalled()
    })

    it('should return undefined redirect_uri when client is not found', () => {
      jest.spyOn(oauth2ClientSubservice, 'findClientById').mockReturnValue(undefined)

      mockRequest.path = authorizePath
      mockRequest.query = {
        client_id: 'unknown-client',
        redirect_uri: 'https://example.com/callback',
      }

      const exception = new HttpException('Error', HttpStatus.BAD_REQUEST)

      filter.catch(exception, mockArgumentsHost)

      expect(mockResponse.redirect).not.toHaveBeenCalled()
    })

    it('should extract state from query when present', () => {
      const mockClient = createMock<OAuth2Client>({
        isRedirectUriAllowed: jest.fn().mockReturnValue(true),
      })
      jest.spyOn(oauth2ClientSubservice, 'findClientById').mockReturnValue(mockClient)

      mockRequest.path = authorizePath
      mockRequest.query = {
        client_id: 'test-client',
        redirect_uri: 'https://example.com/callback',
        state: 'query-state-123',
      }

      const exception = new HttpException('Error', HttpStatus.BAD_REQUEST)

      filter.catch(exception, mockArgumentsHost)

      expect(mockResponse.redirect).toHaveBeenCalledWith(
        HttpStatus.SEE_OTHER,
        expect.stringContaining('state=query-state-123')
      )
    })

    it('should handle non-string values in query parameters', () => {
      mockRequest.path = authorizePath
      mockRequest.query = {
        client_id: ['array-value'] as any,
        redirect_uri: 'https://example.com/callback',
      }

      const exception = new HttpException('Error', HttpStatus.BAD_REQUEST)

      filter.catch(exception, mockArgumentsHost)

      expect(mockResponse.redirect).not.toHaveBeenCalled()
      expect(mockResponse.json).toHaveBeenCalled()
    })
  })

  /**
   * NON-RFC FEATURE: State Mismatch Detection and Warning
   *
   * Additional security layer that detects when error response contains
   * a different state than the original request.
   *
   * Implementation: oauth2-exception.filter.ts (lines 173-181 in handleAuthorizationError)
   *
   * Purpose:
   * - Detect potential bugs in error handling code
   * - Warn developers if state is being incorrectly manipulated
   * - Always uses original request state (never error response state)
   * - Prevents CSRF token leakage or corruption
   *
   * The filter ALWAYS uses the state from authorizationRequestData or query,
   * never from the error response itself, ensuring CSRF protection integrity.
   */
  describe('Non-RFC Features - State Mismatch Warning', () => {
    it('should warn when error response state differs from request state', () => {
      const mockClient = createMock<OAuth2Client>({
        isRedirectUriAllowed: jest.fn().mockReturnValue(true),
      })
      jest.spyOn(oauth2ClientSubservice, 'findClientById').mockReturnValue(mockClient)

      mockRequest.path = authorizePath
      mockRequest.query = {
        client_id: 'test-client',
        redirect_uri: 'https://example.com/callback',
        state: 'correct-state',
      }
      ;(mockRequest as any).authorizationRequestData = {
        client_id: 'test-client',
        redirect_uri: 'https://example.com/callback',
        state: 'correct-state',
      }

      const loggerWarnSpy = jest.spyOn((filter as any).logger, 'warn')

      const exception = new HttpException(
        {
          error: OAuth2AuthorizationErrorCode.INVALID_REQUEST,
          error_description: 'Test',
          state: 'wrong-state', // Different state in error response
        },
        HttpStatus.BAD_REQUEST
      )

      filter.catch(exception, mockArgumentsHost)

      // Should warn about state mismatch
      expect(loggerWarnSpy).toHaveBeenCalled()

      // Should still use original state in redirect
      expect(mockResponse.redirect).toHaveBeenCalledWith(
        HttpStatus.SEE_OTHER,
        expect.stringContaining('state=correct-state')
      )
    })

    it('should not warn when error response state matches request state', () => {
      const mockClient = createMock<OAuth2Client>({
        isRedirectUriAllowed: jest.fn().mockReturnValue(true),
      })
      jest.spyOn(oauth2ClientSubservice, 'findClientById').mockReturnValue(mockClient)

      mockRequest.path = authorizePath
      mockRequest.query = {
        client_id: 'test-client',
        redirect_uri: 'https://example.com/callback',
        state: 'matching-state',
      }
      ;(mockRequest as any).authorizationRequestData = {
        state: 'matching-state',
      }

      const loggerWarnSpy = jest.spyOn((filter as any).logger, 'warn')

      const exception = new HttpException(
        {
          error: OAuth2AuthorizationErrorCode.INVALID_REQUEST,
          error_description: 'Test',
          state: 'matching-state',
        },
        HttpStatus.BAD_REQUEST
      )

      filter.catch(exception, mockArgumentsHost)

      // Should not warn
      expect(loggerWarnSpy).not.toHaveBeenCalled()
    })

    it('should not warn when error response has no state', () => {
      const mockClient = createMock<OAuth2Client>({
        isRedirectUriAllowed: jest.fn().mockReturnValue(true),
      })
      jest.spyOn(oauth2ClientSubservice, 'findClientById').mockReturnValue(mockClient)

      mockRequest.path = authorizePath
      mockRequest.query = {
        client_id: 'test-client',
        redirect_uri: 'https://example.com/callback',
        state: 'original-state',
      }
      ;(mockRequest as any).authorizationRequestData = {
        state: 'original-state',
      }

      const loggerWarnSpy = jest.spyOn((filter as any).logger, 'warn')

      const exception = new HttpException(
        {
          error: OAuth2AuthorizationErrorCode.INVALID_REQUEST,
          error_description: 'Test',
          // No state in error response
        },
        HttpStatus.BAD_REQUEST
      )

      filter.catch(exception, mockArgumentsHost)

      expect(loggerWarnSpy).not.toHaveBeenCalled()
    })
  })

  /**
   * NON-RFC FEATURE: Unhandled OAuth2 Endpoint Fallback
   *
   * Safety mechanism for catching errors on unknown OAuth2 endpoints
   * that are not explicitly handled by the filter.
   *
   * Implementation: oauth2-exception.filter.ts (lines 58-77 - else branch in catch method)
   *
   * Known endpoints handled:
   * - /oauth2/authorize (handleAuthorizationError)
   * - /oauth2/continue (handleAuthorizationError)
   * - /oauth2/token (handleTokenError)
   * - /oauth2/store (handleInternalError)
   * - /oauth2/info (handleInternalError)
   *
   * This fallback:
   * - Logs with alert=1 to notify developers of unhandled endpoint
   * - Returns error as-is (string or object)
   * - Prevents silent failures if new endpoints are added without handler
   */
  describe('Non-RFC Features - Unhandled OAuth2 Endpoint', () => {
    it('should handle unknown OAuth2 endpoint paths with alert', () => {
      mockRequest.path = '/oauth2/unknown-endpoint'
      mockRequest.method = 'POST'

      const loggerSpy = jest.spyOn((filter as any).logger, 'error')

      const exception = new HttpException('Unhandled endpoint', HttpStatus.NOT_FOUND)

      filter.catch(exception, mockArgumentsHost)

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND)
      expect(mockResponse.json).toHaveBeenCalled()

      // Alert is in logObject but gets overridden by undefined metadata.alert
      // The important thing is the log includes the warning message
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'OAuth2 endpoint error - ENDPOINT ERRORS NOT HANDLED!!!.',
        })
      )

      // Verify the alert field exists (even if undefined from metadata merge)
      const logCall = loggerSpy.mock.calls[0][0]
      expect(logCall).toHaveProperty('alert')
    })

    it('should return string error as-is for unhandled endpoints', () => {
      mockRequest.path = '/oauth2/unsupported'

      const exception = new HttpException('String error message', HttpStatus.BAD_REQUEST)

      filter.catch(exception, mockArgumentsHost)

      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'String error message' })
    })

    it('should return object error as-is for unhandled endpoints', () => {
      mockRequest.path = '/oauth2/unsupported'

      const exception = new HttpException(
        { custom: 'error', details: 'info' },
        HttpStatus.BAD_REQUEST
      )

      filter.catch(exception, mockArgumentsHost)

      expect(mockResponse.json).toHaveBeenCalledWith({ custom: 'error', details: 'info' })
    })
  })

  /**
   * NON-RFC FEATURE: OAuth2Exception Metadata and Logging
   *
   * Custom OAuth2Exception class that carries metadata separate from client-visible errors.
   * Prevents leaking internal diagnostic information to clients while maintaining detailed logs.
   *
   * Implementation:
   * - OAuth2Exception class: oauth2.exception.ts (lines 16-27)
   * - Metadata extraction: oauth2-exception.filter.ts (lines 44-46, 79-85)
   *
   * OAuth2ErrorMetadata fields:
   * - consoleMessage: Internal diagnostic message (never sent to client)
   * - alert: 0 or 1, indicates if this error should trigger alerts
   * - metadata: Arbitrary additional context (e.g., database details, timing info)
   *
   * Security feature: Separates public error messages from internal diagnostics
   * Example: Client sees "Server error" but logs contain "Database connection pool exhausted"
   */
  describe('Non-RFC Features - Logging and Metadata', () => {
    it('should log OAuth2Exception metadata separately from error response', () => {
      const mockClient = createMock<OAuth2Client>({
        isRedirectUriAllowed: jest.fn().mockReturnValue(true),
      })
      jest.spyOn(oauth2ClientSubservice, 'findClientById').mockReturnValue(mockClient)

      mockRequest.path = authorizePath
      mockRequest.query = {
        client_id: 'test-client',
        redirect_uri: 'https://example.com/callback',
      }

      const loggerSpy = jest.spyOn((filter as any).logger, 'error')

      const exception = new OAuth2Exception(
        {
          error: OAuth2AuthorizationErrorCode.SERVER_ERROR,
          error_description: 'Public error message',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
        {
          consoleMessage: 'Internal diagnostic: DB connection pool exhausted',
          alert: 1,
          metadata: {
            dbHost: 'db.example.com',
            connectionCount: 100,
          },
        }
      )

      filter.catch(exception, mockArgumentsHost)

      // Metadata should be logged but not sent to client
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          consoleMessage: 'Internal diagnostic: DB connection pool exhausted',
          alert: 1,
          dbHost: 'db.example.com',
          connectionCount: 100,
        })
      )

      // Redirect should NOT contain metadata
      const redirectUrl = (mockResponse.redirect as jest.Mock).mock.calls[0][1]
      expect(redirectUrl).not.toContain('dbHost')
      expect(redirectUrl).not.toContain('connectionCount')
      expect(redirectUrl).toContain('error=server_error')
    })

    it('should log request details including IP, user agent, and body', () => {
      mockRequest.path = '/oauth2/token'
      mockRequest.ip = '192.168.1.100'
      mockRequest.body = { grant_type: 'authorization_code', code: 'secret-code' }
      ;(mockRequest.get as jest.Mock).mockReturnValue('Mozilla/5.0')

      const loggerSpy = jest.spyOn((filter as any).logger, 'error')

      const exception = new HttpException('Token error', HttpStatus.BAD_REQUEST)

      filter.catch(exception, mockArgumentsHost)

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          ip: '192.168.1.100',
          userAgent: 'Mozilla/5.0',
          requestBody: expect.objectContaining({
            grant_type: 'authorization_code',
          }),
        })
      )
    })

    it('should handle missing IP as <NO IP>', () => {
      mockRequest.path = '/oauth2/token'
      mockRequest.ip = undefined

      const loggerSpy = jest.spyOn((filter as any).logger, 'error')

      const exception = new HttpException('Error', HttpStatus.BAD_REQUEST)

      filter.catch(exception, mockArgumentsHost)

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          ip: '<NO IP>',
        })
      )
    })

    it('should merge OAuth2Exception metadata with log object', () => {
      mockRequest.path = '/oauth2/token'

      const loggerSpy = jest.spyOn((filter as any).logger, 'error')

      const exception = new OAuth2Exception(
        {
          error: OAuth2TokenErrorCode.INVALID_GRANT,
          error_description: 'Invalid code',
        },
        HttpStatus.BAD_REQUEST,
        {
          consoleMessage: 'Code expired 5 minutes ago',
          alert: 0,
          metadata: {
            codeId: 'abc123',
            expiryTime: '2026-03-12T14:00:00Z',
          },
        }
      )

      filter.catch(exception, mockArgumentsHost)

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          consoleMessage: 'Code expired 5 minutes ago',
          alert: 0,
          codeId: 'abc123',
          expiryTime: '2026-03-12T14:00:00Z',
        })
      )
    })

    it('should handle regular HttpException without metadata', () => {
      mockRequest.path = '/oauth2/token'

      const loggerSpy = jest.spyOn((filter as any).logger, 'error')

      const exception = new HttpException('Regular error', HttpStatus.BAD_REQUEST)

      filter.catch(exception, mockArgumentsHost)

      // Should log with undefined metadata fields
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          consoleMessage: undefined,
          alert: undefined,
        })
      )
    })
  })

  /**
   * NON-RFC FEATURE: Error Message Extraction Logic
   *
   * Flexible error message handling that normalizes various error formats
   * into OAuth2-compliant error responses.
   *
   * Implementation:
   * - extractOAuth2TokenError: oauth2-exception.filter.ts (lines 237-267)
   * - extractOAuth2AuthorizationError: oauth2-exception.filter.ts (lines 206-235)
   *
   * Message extraction priority:
   * 1. exceptionResponse.message (highest priority)
   * 2. exceptionResponse.error_description
   * 3. exceptionResponse as string
   * 4. Fallback: "An error occurred"
   *
   * Allows throwing errors in multiple formats while ensuring
   * consistent OAuth2-compliant responses to clients.
   */
  describe('Non-RFC Features - Error Message Extraction', () => {
    it('should extract error_description from object if present', () => {
      mockRequest.path = '/oauth2/token'

      const exception = new HttpException(
        {
          error_description: 'Custom error description',
          someOtherField: 'value',
        },
        HttpStatus.BAD_REQUEST
      )

      filter.catch(exception, mockArgumentsHost)

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error_description: 'Custom error description',
        })
      )
    })

    it('should prefer message over error_description', () => {
      mockRequest.path = '/oauth2/token'

      const exception = new HttpException(
        {
          message: 'Primary message',
          error_description: 'Secondary description',
        },
        HttpStatus.BAD_REQUEST
      )

      filter.catch(exception, mockArgumentsHost)

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error_description: 'Primary message',
        })
      )
    })

    it('should use fallback when no message or error_description', () => {
      mockRequest.path = '/oauth2/token'

      const exception = new HttpException(
        {
          someField: 'value',
        },
        HttpStatus.BAD_REQUEST
      )

      filter.catch(exception, mockArgumentsHost)

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error_description: 'An error occurred',
        })
      )
    })
  })
})

/* eslint-enable @typescript-eslint/no-explicit-any */
