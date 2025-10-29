import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

// FIXME: make use of this in proper error responses

/**
 * OAuth2 Error Response
 * Implements RFC 6749 Section 5.2 and RFC 7636 Section 4.3
 * 
 * This is the ONLY error DTO needed - error code is dynamic
 */
export class OAuth2ErrorDto {
  @ApiProperty({
    description: 'Error code per OAuth2 specification',
    example: 'invalid_request',
    enum: [
      'invalid_request',
      'invalid_client',
      'invalid_grant',
      'unauthorized_client',
      'unsupported_grant_type',
      'invalid_scope',
      'access_denied',
      'unsupported_response_type',
      'server_error',
      'temporarily_unavailable',
    ],
  })
  error!: string

  @ApiProperty({
    description: 'Human-readable error description',
    example: 'The request is missing a required parameter',
  })
  error_description!: string

  @ApiPropertyOptional({
    description: 'URI identifying the error',
    example: 'https://tools.ietf.org/html/rfc6749#section-5.2',
  })
  error_uri?: string

  @ApiPropertyOptional({
    description: 'State parameter from the request (echoed back)',
    example: 'xK8F2j9pL3mN7qR',
  })
  state?: string
}

/**
 * OAuth2 Error Codes per RFC 6749
 */
export enum OAuth2ErrorCode {
  INVALID_REQUEST = 'invalid_request',
  INVALID_CLIENT = 'invalid_client',
  INVALID_GRANT = 'invalid_grant',
  UNAUTHORIZED_CLIENT = 'unauthorized_client',
  UNSUPPORTED_GRANT_TYPE = 'unsupported_grant_type',
  INVALID_SCOPE = 'invalid_scope',
  ACCESS_DENIED = 'access_denied',
  UNSUPPORTED_RESPONSE_TYPE = 'unsupported_response_type',
  SERVER_ERROR = 'server_error',
  TEMPORARILY_UNAVAILABLE = 'temporarily_unavailable',
}

/**
 * Helper to create an OAuth2 error response object
 */
export function createOAuth2Error(
  error: OAuth2ErrorCode,
  description: string,
  state?: string
): OAuth2ErrorDto {
  return {
    error,
    error_description: description,
    error_uri: 'https://tools.ietf.org/html/rfc6749#section-5.2',
    state,
  }
}

