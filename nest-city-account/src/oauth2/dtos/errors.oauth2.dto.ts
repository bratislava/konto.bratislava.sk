import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { OAuth2AuthorizationErrorCode, OAuth2TokenErrorCode } from '../oauth2.error.enum'
import { IsEnum, IsOptional, IsString } from 'class-validator'

/**
 * OAuth2 Authorization Endpoint Error Response
 * Implements RFC 6749 Sections 4.1.2.1 (Authorization Code Grant) and 4.2.2.1 (Implicit Grant)
 */
export class OAuth2AuthorizationErrorDto {
  @ApiProperty({
    description: 'Error code per OAuth2 specification (Authorization Endpoint)',
    example: 'invalid_request',
    enum: OAuth2AuthorizationErrorCode,
    enumName: 'OAuth2AuthorizationErrorCode',
  })
  @IsEnum(OAuth2AuthorizationErrorCode)
  @IsString()
  error!: string

  @ApiPropertyOptional({
    description: 'Human-readable error description',
    example: 'The request is missing a required parameter',
  })
  @IsOptional()
  @IsString()
  error_description?: string

  @ApiPropertyOptional({
    description: 'URI identifying the error',
    example: 'https://tools.ietf.org/html/rfc6749#section-4.1.2.1',
  })
  @IsOptional()
  @IsString()
  error_uri?: string

  @ApiProperty({
    description:
      'State parameter from the request (REQUIRED if state was present in the authorization request)',
    example: 'xK8F2j9pL3mN7qR',
  })
  @IsOptional()
  @IsString()
  state?: string
}

/**
 * OAuth2 Token Endpoint Error Response
 * Implements RFC 6749 Section 5.2
 */
export class OAuth2TokenErrorDto {
  @ApiProperty({
    description: 'Error code per OAuth2 specification (Token Endpoint)',
    example: 'invalid_request',
    enum: OAuth2TokenErrorCode,
    enumName: 'OAuth2TokenErrorCode',
  })
  @IsEnum(OAuth2TokenErrorCode)
  @IsString()
  error!: string

  @ApiPropertyOptional({
    description: 'Human-readable error description',
    example: 'The request is missing a required parameter',
  })
  @IsOptional()
  @IsString()
  error_description?: string

  @ApiPropertyOptional({
    description: 'URI identifying the error',
    example: 'https://tools.ietf.org/html/rfc6749#section-5.2',
  })
  @IsOptional()
  @IsString()
  error_uri?: string

  // Note: state is NOT included in token endpoint error responses per RFC 6749
}
