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

  @EnvPort()
  PORT: number

  @EnvString()
  DATABASE_URL: string

  @EnvInt({ min: 1 })
  DB_CONCURRENCY: number

  @EnvUrl()
  CITY_ACCOUNT_API_URL: string

  @EnvString()
  CITY_ACCOUNT_ADMIN_API_KEY: string

  @EnvString()
  COGNITO_USER_POOL_ID: string

  @EnvString()
  COGNITO_CLIENT_ID: string

  @EnvString()
  COGNITO_REGION: string

  @EnvString()
  AWS_COGNITO_ACCESS: string

  @EnvString()
  AWS_COGNITO_SECRET: string

  @EnvString()
  ADMIN_APP_SECRET: string

  @EnvString()
  AWS_SES_SMTP_USERNAME: string

  @EnvString()
  AWS_SES_SMTP_PASSWORD: string

  @EnvString()
  AWS_SES_SENDER_EMAIL: string

  @EnvString()
  PAYGATE_CURRENCY: string

  @EnvUrl()
  PAYGATE_PAYMENT_REDIRECT_URL: string

  @EnvUrl()
  PAYGATE_REDIRECT_URL: string

  @EnvUrl()
  PAYGATE_AFTER_PAYMENT_REDIRECT_FRONTEND: string

  @EnvString()
  PAYGATE_KEY: string

  @EnvString()
  PAYGATE_SIGN_CERT: string

  @EnvString()
  PAYGATE_MERCHANT_NUMBER: string

  @EnvString()
  PAYGATE_PASSPHRASE: string

  @EnvString()
  PAYGATE_KEY_KO: string

  @EnvString()
  PAYGATE_SIGN_CERT_KO: string

  @EnvString()
  PAYGATE_MERCHANT_NUMBER_KO: string

  @EnvString()
  PAYGATE_PASSPHRASE_KO: string

  @EnvString()
  PAYMENT_QR_BENEFICIARY_NAME: string

  @EnvString()
  MSSQL_HOST: string

  @EnvString()
  MSSQL_DB: string

  @EnvString()
  MSSQL_USERNAME: string

  @EnvString()
  MSSQL_PASSWORD: string

  @EnvUrl()
  BLOOMREACH_API_URL: string

  @EnvString()
  BLOOMREACH_API_KEY: string

  @EnvString()
  BLOOMREACH_API_SECRET: string

  @EnvString()
  BLOOMREACH_PROJECT_TOKEN: string

  @EnvBoolean()
  FEATURE_TOGGLE_UPDATE_TAXES_FROM_NORIS: boolean

  @EnvBoolean()
  FEATURE_TOGGLE_SEND_BLOOMREACH_EVENTS: boolean

  @EnvString()
  REPORTING_ICO: string

  @EnvString()
  REPORTING_SFTP_HOST: string

  @EnvPort()
  REPORTING_SFTP_PORT: number

  @EnvString()
  REPORTING_SFTP_USER: string

  @EnvString()
  REPORTING_SFTP_KEY: string

  @EnvString()
  REPORTING_FILE_NAME: string

  @EnvString()
  REPORTING_ACCOUNT_ID: string

  @EnvString()
  REPORTING_BANK_ID: string

  @EnvString()
  REPORTING_SFTP_FILES_PATH: string

  @EnvString()
  REPORTING_PKO_FILE_NAME: string

  @EnvString()
  REPORTING_PKO_ACCOUNT_ID: string

  @EnvString()
  REPORTING_PKO_BANK_ID: string

  @EnvString()
  REPORTING_PKO_SFTP_FILES_PATH: string
}
