import { Transform } from 'class-transformer'
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator'

export enum BloomreachIntegrationState {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string

  @IsString()
  @IsNotEmpty()
  AWS_COGNITO_CLIENT_ID: string

  @IsString()
  @IsNotEmpty()
  AWS_COGNITO_USERPOOL_ID: string

  @IsString()
  @IsNotEmpty()
  AWS_COGNITO_REGION: string

  @IsString()
  @IsNotEmpty()
  AWS_COGNITO_ACCESS: string

  @IsString()
  @IsNotEmpty()
  AWS_COGNITO_SECRET: string

  @IsUrl()
  @IsNotEmpty()
  MAGPROXY_URL: string

  @IsUrl()
  @IsNotEmpty()
  MAGPROXY_AZURE_AD_URL: string

  @IsString()
  @IsNotEmpty()
  MAGPROXY_AZURE_CLIENT_ID: string

  @IsString()
  @IsNotEmpty()
  MAGPROXY_AZURE_CLIENT_SECRET: string

  @IsString()
  @IsNotEmpty()
  MAGPROXY_AZURE_SCOPE: string

  @IsString()
  @IsNotEmpty()
  RABBIT_MQ_URI: string

  @IsString()
  @IsNotEmpty()
  TURNSTILE_SECRET: string

  @IsString()
  @IsNotEmpty()
  MAILGUN_API_KEY: string

  @IsString()
  @IsNotEmpty()
  DEFAULT_MAILGUN_DOMAIN: string

  @IsUrl()
  @IsNotEmpty()
  SLOVENSKO_SK_CONTAINER_URI: string

  @IsString()
  @IsNotEmpty()
  API_TOKEN_PRIVATE: string

  @IsString()
  @IsNotEmpty()
  OBO_TOKEN_PUBLIC: string

  @IsString()
  @IsNotEmpty()
  SUB_NASES_TECHNICAL_ACCOUNT: string

  @IsEnum(BloomreachIntegrationState)
  @IsNotEmpty()
  BLOOMREACH_INTEGRATION_STATE: BloomreachIntegrationState

  @IsString()
  @IsNotEmpty()
  BLOOMREACH_PROJECT_TOKEN: string

  @IsString()
  @IsNotEmpty()
  BLOOMREACH_API_KEY: string

  @IsString()
  @IsNotEmpty()
  BLOOMREACH_API_SECRET: string

  @IsUrl()
  @IsNotEmpty()
  BLOOMREACH_API_URL: string

  @IsUrl()
  @IsNotEmpty()
  TAX_BACKEND_URL: string

  @IsString()
  @IsNotEmpty()
  TAX_BACKEND_API_KEY: string

  @IsString()
  @IsNotEmpty()
  ADMIN_APP_SECRET: string

  @IsString()
  @IsNotEmpty()
  CRYPTO_SECRET_KEY: string

  @IsInt()
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  PORT: number = 4000

  // Database related
  @IsString()
  @IsNotEmpty()
  POSTGRES_DB: string

  @IsString()
  @IsNotEmpty()
  POSTGRES_USER: string

  @IsString()
  @IsNotEmpty()
  POSTGRES_PASSWORD: string

  // Forms related
  @IsString()
  @IsNotEmpty()
  NEST_FORMS_BACKEND_USERNAME: string

  @IsString()
  @IsNotEmpty()
  NEST_FORMS_BACKEND_PASSWORD: string

  // Ginis API
  @IsString()
  @IsNotEmpty()
  GINIS_USERNAME: string

  @IsString()
  @IsNotEmpty()
  GINIS_PASSWORD: string

  // JWT
  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string

  // Scanner
  @IsString()
  @IsNotEmpty()
  NEST_CLAMAV_SCANNER_USERNAME: string

  @IsString()
  @IsNotEmpty()
  NEST_CLAMAV_SCANNER_PASSWORD: string

  // OLO SMTP
  @IsString()
  @IsNotEmpty()
  OLO_SMTP_USERNAME: string

  @IsString()
  @IsNotEmpty()
  OLO_SMTP_PASSWORD: string

  // Sharepoint
  @IsString()
  @IsNotEmpty()
  SHAREPOINT_CLIENT_ID: string

  @IsString()
  @IsNotEmpty()
  SHAREPOINT_CLIENT_SECRET: string

  @IsString()
  @IsNotEmpty()
  SHAREPOINT_TENANT_ID: string
}
