import { EnvBoolean, EnvEnum, EnvInt, EnvPort, EnvString, EnvUrl } from './environment-decorators'

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

  @EnvPort()
  PORT: number

  @EnvString()
  DATABASE_URL: string

  @EnvInt(1)
  DB_CONCURRENCY: number

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

  @EnvUrl()
  MAGPROXY_URL: string

  @EnvUrl()
  MAGPROXY_AZURE_AD_URL: string

  @EnvString()
  MAGPROXY_AZURE_CLIENT_ID: string

  @EnvString()
  MAGPROXY_AZURE_CLIENT_SECRET: string

  @EnvString()
  MAGPROXY_AZURE_SCOPE: string

  @EnvString()
  RABBIT_MQ_URI: string

  @EnvString()
  REDIS_SERVICE: string

  @EnvString()
  REDIS_PASSWORD: string

  @EnvString()
  REDIS_USER: string

  @EnvPort()
  REDIS_PORT: number

  @EnvString(false)
  TURNSTILE_SECRET?: string

  @EnvString()
  MAILGUN_API_KEY: string

  @EnvString()
  DEFAULT_MAILGUN_DOMAIN: string

  @EnvUrl()
  SLOVENSKO_SK_CONTAINER_URI: string

  @EnvString()
  API_TOKEN_PRIVATE: string

  @EnvString()
  OBO_TOKEN_PUBLIC: string

  @EnvString()
  SUB_NASES_TECHNICAL_ACCOUNT: string

  @EnvString()
  BLOOMREACH_INTEGRATION_STATE: string

  @EnvString()
  BLOOMREACH_PROJECT_TOKEN: string

  @EnvString()
  BLOOMREACH_API_KEY: string

  @EnvString()
  BLOOMREACH_API_SECRET: string

  @EnvUrl()
  BLOOMREACH_API_URL: string

  @EnvString()
  BLOOMREACH_CONTACT_DB_HOST: string

  @EnvPort()
  BLOOMREACH_CONTACT_DB_PORT: number

  @EnvString()
  BLOOMREACH_CONTACT_DB_NAME: string

  @EnvString()
  BLOOMREACH_CONTACT_DB_USER: string

  @EnvString()
  BLOOMREACH_CONTACT_DB_PASSWORD: string

  @EnvUrl()
  ENFORCEMENT_BACKEND_URL: string

  @EnvString()
  ENFORCEMENT_BACKEND_TOW_API_KEY: string

  @EnvString()
  ADMIN_APP_SECRET: string

  @EnvString()
  CRYPTO_SECRET_KEY: string

  @EnvInt(1, 12)
  MUNICIPAL_TAX_LOCK_MONTH: number

  @EnvInt(1, 31)
  MUNICIPAL_TAX_LOCK_DAY: number

  @EnvUrl()
  OAUTH2_LOGIN_URL: string

  // TODO: validate that this is a comma-separated list of uppercase identifiers
  // (e.g. "DPB,PAAS_MPA") once we have a dedicated decorator for that pattern.
  @EnvString(false)
  OAUTH2_CLIENT_LIST?: string

  @EnvString()
  MSSQL_HOST: string

  @EnvString()
  MSSQL_DB: string

  @EnvString()
  MSSQL_USERNAME: string

  @EnvString()
  MSSQL_PASSWORD: string

  @EnvPort()
  MSSQL_PORT: number

  @EnvString(false)
  PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?: string

  @EnvBoolean()
  REQUIRE_HTTPS: boolean
}
