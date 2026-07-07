import validateEnvironmentVariables from '../environment-variables.validate'

const VALID_ENV: Record<string, string> = {
  NODE_ENV: 'production',
  CLUSTER_ENV: 'staging',
  PORT: '3000',
  DATABASE_URL: 'postgresql://localhost:5432/db',
  DB_CONCURRENCY: '10',
  AWS_COGNITO_CLIENT_ID: 'client-id',
  AWS_COGNITO_USERPOOL_ID: 'userpool-id',
  AWS_COGNITO_REGION: 'eu-central-1',
  AWS_COGNITO_ACCESS: 'access',
  AWS_COGNITO_SECRET: 'secret',
  MAGPROXY_URL: 'https://magproxy.example.com',
  MAGPROXY_AZURE_AD_URL: 'https://login.microsoftonline.com/tenant/oauth2/v2.0/token',
  MAGPROXY_AZURE_CLIENT_ID: 'azure-client-id',
  MAGPROXY_AZURE_CLIENT_SECRET: 'azure-secret',
  MAGPROXY_AZURE_SCOPE: 'api://azure-client-id/.default',
  RABBIT_MQ_URI: 'amqp://guest:guest@localhost:5672',
  REDIS_SERVICE: 'localhost',
  REDIS_PASSWORD: 'redis-password',
  MAILGUN_API_KEY: 'mailgun-key',
  DEFAULT_MAILGUN_DOMAIN: 'example.com',
  SLOVENSKO_SK_CONTAINER_URI: 'https://slovensko-sk-api.example.com',
  API_TOKEN_PRIVATE: 'token-private',
  OBO_TOKEN_PUBLIC: 'token-public',
  SUB_NASES_TECHNICAL_ACCOUNT: 'account',
  BLOOMREACH_INTEGRATION_STATE: 'ACTIVE',
  BLOOMREACH_PROJECT_TOKEN: 'project-token',
  BLOOMREACH_API_KEY: 'bloomreach-key',
  BLOOMREACH_API_SECRET: 'bloomreach-secret',
  BLOOMREACH_API_URL: 'https://api.bloomreach.example.com',
  BLOOMREACH_CONTACT_DB_HOST: 'localhost',
  BLOOMREACH_CONTACT_DB_PORT: '5432',
  BLOOMREACH_CONTACT_DB_NAME: 'bloomreach',
  BLOOMREACH_CONTACT_DB_USER: 'bloomreach',
  BLOOMREACH_CONTACT_DB_PASSWORD: 'password',
  ENFORCEMENT_BACKEND_URL: 'https://enforcement.example.com',
  ENFORCEMENT_BACKEND_TOW_API_KEY: 'tow-key',
  ADMIN_APP_SECRET: 'admin-secret',
  CRYPTO_SECRET_KEY: 'crypto-secret',
  MUNICIPAL_TAX_LOCK_MONTH: '4',
  MUNICIPAL_TAX_LOCK_DAY: '1',
  MSSQL_HOST: 'localhost',
  MSSQL_DB: 'db',
  MSSQL_USERNAME: 'user',
  MSSQL_PASSWORD: 'password',
  MSSQL_PORT: '1433',
}

describe('validateEnvironmentVariables', () => {
  it('validates a fully-populated, valid config without throwing', () => {
    expect(() => validateEnvironmentVariables(VALID_ENV)).not.toThrow()
  })

  it('throws when a required field is missing', () => {
    const withoutDatabaseUrl = { ...VALID_ENV }
    delete withoutDatabaseUrl.DATABASE_URL
    expect(() => validateEnvironmentVariables(withoutDatabaseUrl)).toThrow(
      'Environment validation failed'
    )
  })

  it.each(['', '   '])(
    'treats an optional numeric field set to %j as absent instead of crashing the whole config',
    (emptyValue) => {
      const config = validateEnvironmentVariables({ ...VALID_ENV, REDIS_PORT: emptyValue })
      expect(config.REDIS_PORT).toBeUndefined()
    }
  )

  it.each(['', '   '])(
    'treats an optional boolean field set to %j as absent instead of crashing the whole config',
    (emptyValue) => {
      const config = validateEnvironmentVariables({ ...VALID_ENV, REQUIRE_HTTPS: emptyValue })
      expect(config.REQUIRE_HTTPS).toBeUndefined()
    }
  )

  it('still parses a real value for an optional numeric field', () => {
    const config = validateEnvironmentVariables({ ...VALID_ENV, REDIS_PORT: '6380' })
    expect(config.REDIS_PORT).toBe(6380)
  })

  it('still parses a real value for an optional boolean field', () => {
    const config = validateEnvironmentVariables({ ...VALID_ENV, REQUIRE_HTTPS: 'false' })
    expect(config.REQUIRE_HTTPS).toBe(false)
  })

  it('still rejects an empty string for a required numeric field', () => {
    expect(() => validateEnvironmentVariables({ ...VALID_ENV, DB_CONCURRENCY: '' })).toThrow(
      'Environment validation failed'
    )
  })

  it('still rejects an unparseable value for an optional boolean field', () => {
    expect(() => validateEnvironmentVariables({ ...VALID_ENV, REQUIRE_HTTPS: '1' })).toThrow(
      'Environment validation failed'
    )
  })
})
