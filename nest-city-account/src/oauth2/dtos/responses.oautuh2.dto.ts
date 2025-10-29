import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

// FIXME make sure that all responses (error or not) contain `Cache-Control: no-store` and `Pragma: no-cache` headers

/**
 * Response DTO for Authorization Endpoint
 * Returns authorization code to be exchanged for tokens
 * Implements RFC 6749 Section 4.1.2
 */
export class AuthorizationResponseDto {
  @ApiProperty({
    description: 'Authorization code to be exchanged for tokens',
    example: 'SplxlOBeZQQYbYS6WxSbIA',
  })
  code!: string

  @ApiPropertyOptional({
    description: 'The state parameter value from the request (CSRF protection). Only included if state was present in request (RFC 6749 Section 4.1.2)',
    example: 'xK8F2j9pL3mN7qR',
  })
  state?: string

  @ApiPropertyOptional({
    description: 'Issuer identifier for the authorization server',
    example: 'https://authorization-server.com',
  })
  issuer?: string
}

/**
 * Response DTO for Token Endpoint
 * Implements RFC 6749 Section 5.1
 */
export class TokenResponseDto {
  @ApiProperty({
    description: 'Access token issued by the authorization server',
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token!: string

  @ApiProperty({
    description: 'Token type, typically "Bearer"',
    example: 'Bearer',
    enum: ['Bearer'],
  })
  token_type!: string

  @ApiPropertyOptional({
    description: 'Refresh token used to obtain new access tokens',
    example: 'def50200f3b2a7b4e8b1c...',
  })
  refresh_token?: string

  @ApiProperty({
    description: 'Expiration time of the access token in seconds',
    example: 3600,
  })
  expires_in!: number

  @ApiPropertyOptional({
    description: 'Space-delimited list of scopes granted',
    example: 'openid profile email',
  })
  scope?: string

  @ApiPropertyOptional({
    description: 'ID Token for OpenID Connect (if requested)',
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  id_token?: string
}

/**
 * Token Error Response for /token endpoint
 * Implements RFC 6749 Section 5.2
 */
export class TokenErrorResponseDto {
  @ApiProperty({
    description: 'Error code',
    example: 'invalid_request',
    enum: [
      'invalid_request',
      'invalid_client',
      'invalid_grant',
      'unauthorized_client',
      'unsupported_grant_type',
      'invalid_scope',
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
    description: 'State parameter from the request',
    example: 'xK8F2j9pL3mN7qR',
  })
  state?: string
}

/**
 * Authorization Error Response for /authorize endpoint
 * Implements RFC 6749 Section 4.1.2.1
 */
export class AuthorizationErrorResponseDto {
  @ApiProperty({
    description: 'Error code',
    example: 'invalid_request',
    enum: [
      'invalid_request',
      'unauthorized_client',
      'access_denied',
      'unsupported_response_type',
      'invalid_scope',
      'server_error',
      'temporarily_unavailable',
    ],
  })
  error!: string

  @ApiProperty({
    description: 'Human-readable error description',
    example: 'The client is not authorized to use this response type',
  })
  error_description!: string

  @ApiPropertyOptional({
    description: 'URI identifying the error',
    example: 'https://tools.ietf.org/html/rfc6749#section-4.1.2.1',
  })
  error_uri?: string

  @ApiPropertyOptional({
    description: 'State parameter from the request',
    example: 'xK8F2j9pL3mN7qR',
  })
  state?: string
}
