import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator'

export enum GrantType {
  AUTHORIZATION_CODE = 'authorization_code',
  REFRESH_TOKEN = 'refresh_token',
  CLIENT_CREDENTIALS = 'client_credentials',
}

export enum ResponseType {
  CODE = 'code',
  TOKEN = 'token',
}

export enum CodeChallengeMethod {
  S256 = 'S256',
  PLAIN = 'plain',
}

export class AuthorizeRequestDto {
  @ApiProperty({
    description: 'OAuth response type',
    enum: ResponseType,
    example: ResponseType.CODE,
  })
  @IsEnum(ResponseType)
  @IsNotEmpty()
  response_type!: ResponseType

  @ApiProperty({
    description: 'Client ID',
    example: 'dpb-client-id',
  })
  @IsString()
  @IsNotEmpty()
  client_id!: string

  @ApiProperty({
    description: 'Redirect URI',
    example: 'https://partner.example.com/callback',
  })
  @IsUrl()
  @IsNotEmpty()
  redirect_uri!: string

  @ApiPropertyOptional({
    description: 'OAuth scope',
    example: 'openid profile email',
  })
  @IsString()
  @IsOptional()
  scope?: string

  @ApiPropertyOptional({
    description: 'State parameter for CSRF protection',
    example: 'random-state-string',
  })
  @IsString()
  @IsOptional()
  state?: string

  @ApiPropertyOptional({
    description: 'PKCE code challenge',
    example: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
  })
  @IsString()
  @IsOptional()
  code_challenge?: string

  @ApiPropertyOptional({
    description: 'PKCE code challenge method',
    enum: CodeChallengeMethod,
    example: CodeChallengeMethod.S256,
  })
  @IsEnum(CodeChallengeMethod)
  @IsOptional()
  code_challenge_method?: CodeChallengeMethod

  @ApiPropertyOptional({
    description: 'Nonce for ID token validation',
  })
  @IsString()
  @IsOptional()
  nonce?: string
}

export class TokenRequestDto {
  @ApiProperty({
    description: 'Grant type',
    enum: GrantType,
    example: GrantType.AUTHORIZATION_CODE,
  })
  @IsEnum(GrantType)
  @IsNotEmpty()
  grant_type!: GrantType

  @ApiPropertyOptional({
    description: 'Authorization code (required for authorization_code grant)',
    example: 'auth-code-123',
  })
  @IsString()
  @IsOptional()
  code?: string

  @ApiPropertyOptional({
    description: 'Redirect URI (required for authorization_code grant)',
    example: 'https://partner.example.com/callback',
  })
  @IsUrl({}, { message: 'redirect_uri must be a valid URL' })
  @IsOptional()
  redirect_uri?: string

  @ApiProperty({
    description: 'Client ID',
    example: 'dpb-client-id',
  })
  @IsString()
  @IsNotEmpty()
  client_id!: string

  @ApiPropertyOptional({
    description: 'Client secret (can be sent via Basic Auth or body)',
    example: 'dpb-client-secret',
  })
  @IsString()
  @IsOptional()
  client_secret?: string

  @ApiPropertyOptional({
    description: 'Refresh token (required for refresh_token grant)',
    example: 'refresh-token-123',
  })
  @IsString()
  @IsOptional()
  refresh_token?: string

  @ApiPropertyOptional({
    description: 'PKCE code verifier',
    example: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
  })
  @IsString()
  @IsOptional()
  code_verifier?: string

  @ApiPropertyOptional({
    description: 'OAuth scope',
    example: 'openid profile email',
  })
  @IsString()
  @IsOptional()
  scope?: string
}

export class TokenResponseDto {
  @ApiProperty({
    description: 'Access token',
    example: 'eyJraWQiOiJxxx...',
  })
  access_token!: string

  @ApiProperty({
    description: 'ID token',
    example: 'eyJraWQiOiJxxx...',
  })
  id_token!: string

  @ApiPropertyOptional({
    description: 'Refresh token',
    example: 'eyJjdHkiOiJKV1QiLxxx...',
  })
  refresh_token?: string

  @ApiProperty({
    description: 'Token type',
    example: 'Bearer',
  })
  token_type!: string

  @ApiProperty({
    description: 'Expires in (seconds)',
    example: 3600,
  })
  expires_in!: number

  @ApiPropertyOptional({
    description: 'OAuth scope',
    example: 'openid profile email',
  })
  scope?: string
}

export class UserInfoResponseDto {
  @ApiProperty({
    description: 'Subject (user ID)',
    example: '9e7791b2-787b-4b93-8473-94a70a516025',
  })
  sub!: string

  @ApiPropertyOptional({
    description: 'Email address',
    example: 'user@example.com',
  })
  email?: string

  @ApiPropertyOptional({
    description: 'Email verified',
    example: true,
  })
  email_verified?: boolean

  @ApiPropertyOptional({
    description: 'Given name',
    example: 'John',
  })
  given_name?: string

  @ApiPropertyOptional({
    description: 'Family name',
    example: 'Doe',
  })
  family_name?: string

  @ApiPropertyOptional({
    description: 'Full name',
    example: 'John Doe',
  })
  name?: string

  // Allow additional custom attributes (no decorator for index signature)
  [key: string]: unknown
}

export class OAuthErrorDto {
  @ApiProperty({
    description: 'Error code',
    example: 'invalid_request',
  })
  error!: string

  @ApiPropertyOptional({
    description: 'Error description',
    example: 'The request is missing a required parameter',
  })
  error_description?: string

  @ApiPropertyOptional({
    description: 'Error URI',
    example: 'https://tools.ietf.org/html/rfc6749#section-4.1.2.1',
  })
  error_uri?: string
}

export class OpenIdConfigurationDto {
  @ApiProperty({
    description: 'Issuer identifier',
    example: 'https://nest-city-account.bratislava.sk',
  })
  issuer!: string

  @ApiProperty({
    description: 'Authorization endpoint',
    example: 'https://nest-city-account.bratislava.sk/oauth/authorize',
  })
  authorization_endpoint!: string

  @ApiProperty({
    description: 'Token endpoint',
    example: 'https://nest-city-account.bratislava.sk/oauth/token',
  })
  token_endpoint!: string

  @ApiProperty({
    description: 'UserInfo endpoint',
    example: 'https://nest-city-account.bratislava.sk/oauth/userinfo',
  })
  userinfo_endpoint!: string

  @ApiProperty({
    description: 'JWKS URI',
    example: 'https://nest-city-account.bratislava.sk/oauth/.well-known/jwks.json',
  })
  jwks_uri!: string

  @ApiProperty({
    description: 'Response types supported',
    example: ['code', 'token'],
  })
  response_types_supported!: string[]

  @ApiProperty({
    description: 'Grant types supported',
    example: ['authorization_code', 'refresh_token', 'client_credentials'],
  })
  grant_types_supported!: string[]

  @ApiProperty({
    description: 'Subject types supported',
    example: ['public'],
  })
  subject_types_supported!: string[]

  @ApiProperty({
    description: 'ID token signing algorithms supported',
    example: ['RS256'],
  })
  id_token_signing_alg_values_supported!: string[]

  @ApiProperty({
    description: 'Scopes supported',
    example: ['openid', 'profile', 'email'],
  })
  scopes_supported!: string[]

  @ApiProperty({
    description: 'Token endpoint auth methods supported',
    example: ['client_secret_basic', 'client_secret_post'],
  })
  token_endpoint_auth_methods_supported!: string[]

  @ApiProperty({
    description: 'Claims supported',
    example: ['sub', 'email', 'email_verified', 'name', 'given_name', 'family_name'],
  })
  claims_supported!: string[]

  @ApiProperty({
    description: 'Code challenge methods supported',
    example: ['S256', 'plain'],
  })
  code_challenge_methods_supported!: string[]
}
