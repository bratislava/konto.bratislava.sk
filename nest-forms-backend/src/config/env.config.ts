import { Transform } from 'class-transformer'
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator'

export enum NodeEnv {
  Development = 'development',
  Production = 'production',
}

export enum ClusterEnv {
  Dev = 'dev',
  Staging = 'staging',
  Prod = 'prod',
}

export enum BloomreachIntegrationState {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
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
  NASES_SENDER_URI: string

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
  HTTP_BASIC_PASS: string

  @IsString()
  @IsNotEmpty()
  CRYPTO_SECRET_KEY: string

  @IsInt()
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  PORT: number = 4000

  @IsString()
  @IsNotEmpty()
  POSTGRES_DB: string

  @IsString()
  @IsNotEmpty()
  POSTGRES_USER: string

  @IsString()
  @IsNotEmpty()
  POSTGRES_PASSWORD: string

  @IsString()
  @IsNotEmpty()
  NEST_FORMS_BACKEND_USERNAME: string

  @IsString()
  @IsNotEmpty()
  NEST_FORMS_BACKEND_PASSWORD: string

  @IsString()
  @IsNotEmpty()
  GINIS_USERNAME: string

  @IsString()
  @IsNotEmpty()
  GINIS_PASSWORD: string

  @IsUrl()
  @IsNotEmpty()
  GINIS_SSL_HOST: string

  @IsUrl()
  @IsNotEmpty()
  GINIS_GIN_HOST: string

  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string

  @IsString()
  @IsNotEmpty()
  NEST_CLAMAV_SCANNER_USERNAME: string

  @IsString()
  @IsNotEmpty()
  NEST_CLAMAV_SCANNER_PASSWORD: string

  @IsString()
  @IsNotEmpty()
  OLO_SMTP_USERNAME: string

  @IsString()
  @IsNotEmpty()
  OLO_SMTP_PASSWORD: string

  @IsUrl()
  @IsNotEmpty()
  OLO_FRONTEND_URL: string

  @IsString()
  @IsNotEmpty()
  SHAREPOINT_CLIENT_ID: string

  @IsString()
  @IsNotEmpty()
  SHAREPOINT_CLIENT_SECRET: string

  @IsString()
  @IsNotEmpty()
  SHAREPOINT_TENANT_ID: string

  @IsString()
  @IsNotEmpty()
  MINIO_ACCESS_KEY: string

  @IsString()
  @IsNotEmpty()
  MINIO_ENDPOINT: string

  @IsString()
  @IsNotEmpty()
  MINIO_HOST: string

  @IsInt()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNotEmpty()
  MINIO_PORT: number

  @IsString()
  @IsNotEmpty()
  MINIO_SECRET_KEY: string

  @IsBoolean()
  @IsNotEmpty()
  MINIO_USE_SSL: boolean

  @IsString()
  @IsNotEmpty()
  MINIO_UNSCANNED_BUCKET: string

  @IsString()
  @IsNotEmpty()
  MINIO_SAFE_BUCKET: string

  @IsString()
  @IsNotEmpty()
  MINIO_INFECTED_BUCKET: string

  @IsString()
  @IsNotEmpty()
  REDIS_USER: string

  @IsString()
  @IsNotEmpty()
  REDIS_PASSWORD: string

  @IsEnum(NodeEnv)
  @IsNotEmpty()
  NODE_ENV: NodeEnv

  @IsEnum(ClusterEnv)
  @IsNotEmpty()
  CLUSTER_ENV: ClusterEnv

  @IsUrl()
  @IsNotEmpty()
  USER_ACCOUNT_API: string

  @IsUrl()
  @IsNotEmpty()
  NEST_CLAMAV_SCANNER: string

  @IsString()
  @IsNotEmpty()
  NASES_RECIPIENT_URI: string

  @IsString()
  @IsNotEmpty()
  HTTP_BASIC_USER: string

  @IsUrl()
  @IsNotEmpty()
  FRONTEND_URL: string

  @IsUrl()
  @IsNotEmpty()
  SELF_URL: string

  @IsString()
  @IsNotEmpty()
  MAILGUN_DOMAIN: string

  @IsUrl()
  @IsNotEmpty()
  MAILGUN_HOST: string

  @IsString()
  @IsNotEmpty()
  MAILGUN_EMAIL_FROM: string

  @IsInt()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNotEmpty()
  TAX_PDF_JOB_CONCURRENCY: number

  @IsInt()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNotEmpty()
  TAX_PDF_JOB_TIMEOUT: number

  @IsInt()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNotEmpty()
  REDIS_PORT: number

  @IsString()
  @IsNotEmpty()
  SHAREPOINT_DOMAIN: string

  @IsUrl()
  @IsNotEmpty()
  SHAREPOINT_URL: string

  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  @IsNotEmpty()
  FEATURE_TOGGLE_VERSIONING: boolean
}
