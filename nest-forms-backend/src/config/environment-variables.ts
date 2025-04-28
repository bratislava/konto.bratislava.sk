import { Expose } from 'class-transformer'
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator'

export enum NodeEnv {
  Development = 'development',
  Production = 'production',
}

export enum ClusterEnv {
  Dev = 'dev',
  Staging = 'staging',
  Production = 'production',
}

export default class EnvironmentVariables {
  @Expose()
  @IsEnum(NodeEnv)
  @IsNotEmpty()
  NODE_ENV: NodeEnv

  @Expose()
  @IsEnum(ClusterEnv)
  @IsNotEmpty()
  CLUSTER_ENV: ClusterEnv

  @Expose()
  @IsUrl()
  @IsNotEmpty()
  SELF_URL: string

  @Expose()
  @IsInt()
  @IsNotEmpty()
  @Min(0)
  @Max(65_535)
  PORT: number

  @Expose()
  @IsString()
  @IsNotEmpty()
  NEST_FORMS_BACKEND_USERNAME: string

  @Expose()
  @IsString()
  @IsNotEmpty()
  NEST_FORMS_BACKEND_PASSWORD: string

  @Expose()
  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string

  @Expose()
  @IsString()
  @IsNotEmpty()
  ADMIN_APP_SECRET: string

  @Expose()
  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string

  @Expose()
  @IsString()
  @IsNotEmpty()
  AWS_COGNITO_CLIENT_ID: string

  @Expose()
  @IsString()
  @IsNotEmpty()
  AWS_COGNITO_USERPOOL_ID: string

  @Expose()
  @IsString()
  @IsNotEmpty()
  AWS_COGNITO_REGION: string

  @Expose()
  @IsString()
  @IsNotEmpty()
  AWS_COGNITO_ACCESS: string

  @Expose()
  @IsString()
  @IsNotEmpty()
  AWS_COGNITO_SECRET: string

  @Expose()
  @IsString()
  @IsNotEmpty()
  RABBIT_MQ_URI: string

  @Expose()
  @IsString()
  @IsNotEmpty()
  MAILGUN_API_KEY: string

  @Expose()
  @IsString()
  @IsNotEmpty()
  MAILGUN_DOMAIN: string

  @Expose()
  @IsUrl()
  @IsNotEmpty()
  MAILGUN_HOST: string

  @Expose()
  @IsString()
  @IsNotEmpty()
  MAILGUN_EMAIL_FROM: string

  @Expose()
  @IsUrl()
  @IsNotEmpty()
  SLOVENSKO_SK_CONTAINER_URI: string

  @Expose()
  @IsString()
  @IsNotEmpty()
  API_TOKEN_PRIVATE: string

  @Expose()
  @IsString()
  @IsNotEmpty()
  OBO_TOKEN_PUBLIC: string

  @Expose()
  @IsString()
  @IsNotEmpty()
  SUB_NASES_TECHNICAL_ACCOUNT: string

  @Expose()
  @IsString()
  @IsNotEmpty()
  NASES_SENDER_URI: string

  @Expose()
  @IsString()
  @IsNotEmpty()
  NASES_RECIPIENT_URI: string

  @Expose()
  @IsUrl()
  @IsNotEmpty()
  FRONTEND_URL: string

  @Expose()
  @IsUrl()
  @IsNotEmpty()
  USER_ACCOUNT_API: string

  @Expose()
  @IsString()
  @IsNotEmpty()
  NEST_CLAMAV_SCANNER: string

  @Expose()
  @IsString()
  @IsNotEmpty()
  NEST_CLAMAV_SCANNER_USERNAME: string

  @Expose()
  @IsString()
  @IsNotEmpty()
  NEST_CLAMAV_SCANNER_PASSWORD: string

  @Expose()
  @IsString()
  @IsNotEmpty()
  GINIS_USERNAME: string

  @Expose()
  @IsString()
  @IsNotEmpty()
  GINIS_PASSWORD: string

  @Expose()
  @IsUrl()
  @IsNotEmpty()
  GINIS_SSL_HOST: string

  @Expose()
  @IsUrl()
  @IsNotEmpty()
  GINIS_SSL_MTOM_HOST: string

  @Expose()
  @IsUrl()
  @IsNotEmpty()
  GINIS_GIN_HOST: string

  @Expose()
  @IsString()
  @IsNotEmpty()
  OLO_SMTP_USERNAME: string

  @Expose()
  @IsString()
  @IsNotEmpty()
  OLO_SMTP_PASSWORD: string

  @Expose()
  @IsUrl()
  @IsNotEmpty()
  OLO_FRONTEND_URL: string

  @Expose()
  @IsString()
  @IsNotEmpty()
  SHAREPOINT_DOMAIN: string

  @Expose()
  @IsUrl()
  @IsNotEmpty()
  SHAREPOINT_URL: string

  @Expose()
  @IsString()
  @IsNotEmpty()
  SHAREPOINT_CLIENT_ID: string

  @Expose()
  @IsString()
  @IsNotEmpty()
  SHAREPOINT_CLIENT_SECRET: string

  @Expose()
  @IsString()
  @IsNotEmpty()
  SHAREPOINT_TENANT_ID: string

  @Expose()
  @IsString()
  @IsNotEmpty()
  MINIO_ACCESS_KEY: string

  @Expose()
  @IsString()
  @IsNotEmpty()
  MINIO_ENDPOINT: string

  @Expose()
  @IsString()
  @IsNotEmpty()
  MINIO_HOST: string

  @Expose()
  @IsInt()
  @IsNotEmpty()
  @Min(0)
  @Max(65_535)
  MINIO_PORT: number

  @Expose()
  @IsString()
  @IsNotEmpty()
  MINIO_SECRET_KEY: string

  @Expose()
  @IsBoolean()
  @IsNotEmpty()
  MINIO_USE_SSL: boolean

  @Expose()
  @IsString()
  @IsNotEmpty()
  MINIO_UNSCANNED_BUCKET: string

  @Expose()
  @IsString()
  @IsNotEmpty()
  MINIO_SAFE_BUCKET: string

  @Expose()
  @IsString()
  @IsNotEmpty()
  MINIO_INFECTED_BUCKET: string

  @Expose()
  @IsString()
  @IsNotEmpty()
  REDIS_SERVICE: string

  @Expose()
  @IsInt()
  @IsNotEmpty()
  @Min(0)
  @Max(65_535)
  REDIS_PORT: number

  @Expose()
  @IsString()
  @IsNotEmpty()
  REDIS_USER: string

  @Expose()
  @IsString()
  @IsNotEmpty()
  REDIS_PASSWORD: string

  @Expose()
  @IsBoolean()
  @IsNotEmpty()
  FEATURE_TOGGLE_VERSIONING: boolean
}
