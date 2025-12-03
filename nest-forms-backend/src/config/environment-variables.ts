import {
  EnvBoolean,
  EnvEnum,
  EnvInt,
  EnvPort,
  EnvString,
  EnvUrl,
} from './environment-decorators'

export enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export enum ClusterEnv {
  Dev = 'dev',
  Staging = 'staging',
  Production = 'production',
}

export default class EnvironmentVariables {
  @EnvEnum(NodeEnv)
  NODE_ENV: NodeEnv

  @EnvEnum(ClusterEnv)
  CLUSTER_ENV: ClusterEnv

  @EnvUrl()
  SELF_URL: string

  @EnvPort()
  PORT: number

  @EnvString()
  NEST_FORMS_BACKEND_USERNAME: string

  @EnvString()
  NEST_FORMS_BACKEND_PASSWORD: string

  @EnvString()
  DATABASE_URL: string

  @EnvString()
  ADMIN_APP_SECRET: string

  @EnvString()
  JWT_SECRET: string

  @EnvString()
  AWS_COGNITO_CLIENT_ID: string

  @EnvString()
  AWS_COGNITO_USERPOOL_ID: string

  @EnvString()
  AWS_COGNITO_REGION: string

  @EnvString()
  AWS_COGNITO_ACCESS: string

  @EnvString()
  AWS_COGNITO_SECRET: string

  @EnvString()
  AWS_ACCOUNT_ID: string

  @EnvString()
  AWS_UNAUTH_ROLE_NAME: string

  @EnvString()
  RABBIT_MQ_URI: string

  @EnvString()
  MAILGUN_API_KEY: string

  @EnvString()
  MAILGUN_DOMAIN: string

  @EnvUrl()
  MAILGUN_HOST: string

  @EnvString()
  MAILGUN_EMAIL_FROM: string

  @EnvUrl()
  SLOVENSKO_SK_CONTAINER_URI: string

  @EnvString()
  API_TOKEN_PRIVATE: string

  @EnvString()
  OBO_TOKEN_PUBLIC: string

  @EnvString()
  SUB_NASES_TECHNICAL_ACCOUNT: string

  @EnvString()
  NASES_SENDER_URI: string

  @EnvString()
  NASES_RECIPIENT_URI: string

  @EnvUrl()
  FRONTEND_URL: string

  @EnvUrl()
  USER_ACCOUNT_API: string

  @EnvString()
  NEST_CLAMAV_SCANNER: string

  @EnvString()
  NEST_CLAMAV_SCANNER_USERNAME: string

  @EnvString()
  NEST_CLAMAV_SCANNER_PASSWORD: string

  @EnvString()
  GINIS_USERNAME: string

  @EnvString()
  GINIS_PASSWORD: string

  @EnvUrl()
  GINIS_SSL_HOST: string

  @EnvUrl()
  GINIS_SSL_MTOM_HOST: string

  @EnvUrl()
  GINIS_GIN_HOST: string

  @EnvString()
  GINIS_FORM_ID_PROPERTY_ID: string

  @EnvString()
  GINIS_ANONYMOUS_SENDER_ID: string

  @EnvBoolean()
  GINIS_SHOULD_REGISTER: boolean

  @EnvString()
  OLO_SMTP_USERNAME: string

  @EnvString()
  OLO_SMTP_PASSWORD: string

  @EnvUrl()
  OLO_FRONTEND_URL: string

  @EnvString()
  SHAREPOINT_DOMAIN: string

  @EnvString()
  SHAREPOINT_SITE_ID: string

  @EnvString()
  SHAREPOINT_SITE_NAME: string

  @EnvUrl()
  SHAREPOINT_GRAPH_URL: string

  @EnvString()
  SHAREPOINT_CLIENT_ID: string

  @EnvString()
  SHAREPOINT_CLIENT_SECRET: string

  @EnvString()
  SHAREPOINT_TENANT_ID: string

  @EnvString()
  MINIO_ACCESS_KEY: string

  @EnvString()
  MINIO_ENDPOINT: string

  @EnvString()
  MINIO_HOST: string

  @EnvPort()
  MINIO_PORT: number

  @EnvString()
  MINIO_SECRET_KEY: string

  @EnvBoolean()
  MINIO_USE_SSL: boolean

  @EnvBoolean()
  MINIO_PATH_STYLE: boolean

  @EnvString()
  MINIO_UNSCANNED_BUCKET: string

  @EnvString()
  MINIO_SAFE_BUCKET: string

  @EnvString()
  MINIO_INFECTED_BUCKET: string

  @EnvString()
  REDIS_SERVICE: string

  @EnvPort()
  REDIS_PORT: number

  @EnvString()
  REDIS_USER: string

  @EnvString()
  REDIS_PASSWORD: string

  @EnvInt()
  TAX_PDF_JOB_CONCURRENCY: number

  @EnvInt()
  TAX_PDF_JOB_TIMEOUT: number

  @EnvBoolean()
  FEATURE_TOGGLE_VERSIONING: boolean
}
