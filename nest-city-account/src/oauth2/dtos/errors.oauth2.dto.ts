import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { OAuth2AuthorizationErrorCode, OAuth2TokenErrorCode } from '../oauth2.error.enum'
import { IsEnum, IsOptional, IsString } from 'class-validator'

/**
 * OAuth2 Authorization Endpoint Error Response
 * Implements RFC 6749 Sections 4.1.2.1 (Authorization Code Grant) and 4.2.2.1 (Implicit Grant)
 *
 * Per RFC 6749 Section 4.1.2.1:
 *
 * WITH valid redirect_uri:
 * - Errors are returned via 303 redirect (per RFC 9700) to the client's redirect_uri
 * - Error parameters are added to the query string
 * - This DTO represents the parameters in the redirect
 *
 * WITHOUT valid redirect_uri (missing/invalid/mismatching):
 * - The authorization server MUST NOT redirect
 * - Return direct HTTP 400/401 response with this DTO as JSON body
 * - Display error to resource owner
 *
 * This prevents open redirector vulnerabilities when redirect_uri is compromised.
 */{}
export class OAuth2AuthorizationErrorDto {
  @ApiProperty({
    description: 'Single ASCII error code per OAuth 2.0 specification (Authorization Endpoint)',
    example: 'invalid_request',
    enum: OAuth2AuthorizationErrorCode,
    enumName: 'OAuth2AuthorizationErrorCode',
  })
  @IsEnum(OAuth2AuthorizationErrorCode)
  @IsString()
  error!: string

  @ApiPropertyOptional({
    description: 'Human-readable ASCII text providing additional information for debugging (not displayed to end-user)',
    example: 'The request is missing the required redirect_uri parameter',
  })
  @IsOptional()
  @IsString()
  error_description?: string

  @ApiPropertyOptional({
    description: 'URI identifying a human-readable web page with information about the error',
    example: 'https://developer.example.com/errors/invalid_request',
  })
  @IsOptional()
  @IsString()
  error_uri?: string

  @ApiPropertyOptional({
    description: 'Exact value received from the client in the authorization request. REQUIRED if and only if the state parameter was present in the client authorization request. Only included when redirecting (not in direct error responses).',
    example: 'xK8F2j9pL3mN7qR',
  })
  @IsOptional()
  @IsString()
  state?: string
}

/**
 * OAuth2 Token Endpoint Error Response
 * Implements RFC 6749 Section 5.2
 *
 * Per RFC 6749 Section 5.2:
 * "The authorization server responds with an HTTP 400 (Bad Request) status code
 * (unless specified otherwise) and includes the following parameters with the response"
 *
 * These errors are ALWAYS returned as HTTP 400 JSON responses.
 * The state parameter is NOT included in token endpoint error responses.
 */
export class OAuth2TokenErrorDto {
  @ApiProperty({
    description: 'Single ASCII error code per OAuth 2.0 specification (Token Endpoint)',
    example: 'invalid_grant',
    enum: OAuth2TokenErrorCode,
    enumName: 'OAuth2TokenErrorCode',
  })
  @IsEnum(OAuth2TokenErrorCode)
  @IsString()
  error!: string

  @ApiPropertyOptional({
    description: 'Human-readable ASCII text providing additional information for debugging (not displayed to end-user)',
    example: 'The provided authorization code is invalid or expired',
  })
  @IsOptional()
  @IsString()
  error_description?: string

  @ApiPropertyOptional({
    description: 'URI identifying a human-readable web page with information about the error',
    example: 'https://developer.example.com/errors/invalid_grant',
  })
  @IsOptional()
  @IsString()
  error_uri?: string
}
