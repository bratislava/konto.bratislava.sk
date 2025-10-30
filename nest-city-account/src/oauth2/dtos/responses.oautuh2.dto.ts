import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

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
    description:
      'The state parameter value from the request (CSRF protection). Only included if state was present in request (RFC 6749 Section 4.1.2)',
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
