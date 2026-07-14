import EnvironmentVariables from './environment-variables'

export default class BaConfig {
  constructor(protected validatedConfig: EnvironmentVariables) {}

  get environment() {
    return {
      nodeEnv: this.validatedConfig.NODE_ENV,
      clusterEnv: this.validatedConfig.CLUSTER_ENV,
    }
  }

  get self() {
    return {
      port: this.validatedConfig.PORT,
    }
  }

  get database() {
    return {
      url: this.validatedConfig.DATABASE_URL,
      concurrency: this.validatedConfig.DB_CONCURRENCY,
    }
  }

  get tokens() {
    return {
      adminAppSecret: this.validatedConfig.ADMIN_APP_SECRET,
    }
  }

  get security() {
    return {
      cryptoSecretKey: this.validatedConfig.CRYPTO_SECRET_KEY,
      turnstileSecret: this.validatedConfig.TURNSTILE_SECRET,
      requireHttps: this.validatedConfig.REQUIRE_HTTPS,
    }
  }

  get cognito() {
    return {
      clientId: this.validatedConfig.AWS_COGNITO_CLIENT_ID,
      userPoolId: this.validatedConfig.AWS_COGNITO_USERPOOL_ID,
      region: this.validatedConfig.AWS_COGNITO_REGION,
      accessKeyId: this.validatedConfig.AWS_COGNITO_ACCESS,
      secretAccessKey: this.validatedConfig.AWS_COGNITO_SECRET,
    }
  }

  get magproxy() {
    return {
      url: this.validatedConfig.MAGPROXY_URL,
      azureAdUrl: this.validatedConfig.MAGPROXY_AZURE_AD_URL,
      azureClientId: this.validatedConfig.MAGPROXY_AZURE_CLIENT_ID,
      azureClientSecret: this.validatedConfig.MAGPROXY_AZURE_CLIENT_SECRET,
      azureScope: this.validatedConfig.MAGPROXY_AZURE_SCOPE,
    }
  }

  get rabbitMq() {
    return {
      uri: this.validatedConfig.RABBIT_MQ_URI,
    }
  }

  get redis() {
    return {
      service: this.validatedConfig.REDIS_SERVICE,
      password: this.validatedConfig.REDIS_PASSWORD,
      user: this.validatedConfig.REDIS_USER,
      port: this.validatedConfig.REDIS_PORT,
    }
  }

  get mailgun() {
    return {
      apiKey: this.validatedConfig.MAILGUN_API_KEY,
      defaultDomain: this.validatedConfig.DEFAULT_MAILGUN_DOMAIN,
    }
  }

  get nases() {
    return {
      containerUri: this.validatedConfig.SLOVENSKO_SK_CONTAINER_URI,
      apiTokenPrivate: this.validatedConfig.API_TOKEN_PRIVATE,
      oboTokenPublic: this.validatedConfig.OBO_TOKEN_PUBLIC,
      subNasesTechnicalAccount: this.validatedConfig.SUB_NASES_TECHNICAL_ACCOUNT,
    }
  }

  get bloomreach() {
    return {
      integrationState: this.validatedConfig.BLOOMREACH_INTEGRATION_STATE,
      projectToken: this.validatedConfig.BLOOMREACH_PROJECT_TOKEN,
      apiKey: this.validatedConfig.BLOOMREACH_API_KEY,
      apiSecret: this.validatedConfig.BLOOMREACH_API_SECRET,
      apiUrl: this.validatedConfig.BLOOMREACH_API_URL,
    }
  }

  get bloomreachContactDatabase() {
    return {
      host: this.validatedConfig.BLOOMREACH_CONTACT_DB_HOST,
      port: this.validatedConfig.BLOOMREACH_CONTACT_DB_PORT,
      database: this.validatedConfig.BLOOMREACH_CONTACT_DB_NAME,
      user: this.validatedConfig.BLOOMREACH_CONTACT_DB_USER,
      password: this.validatedConfig.BLOOMREACH_CONTACT_DB_PASSWORD,
    }
  }

  get enforcement() {
    return {
      backendUrl: this.validatedConfig.ENFORCEMENT_BACKEND_URL,
      towApiKey: this.validatedConfig.ENFORCEMENT_BACKEND_TOW_API_KEY,
    }
  }

  get taxDeadline() {
    return {
      month: this.validatedConfig.MUNICIPAL_TAX_LOCK_MONTH,
      day: this.validatedConfig.MUNICIPAL_TAX_LOCK_DAY,
    }
  }

  get oauth2() {
    return {
      loginUrl: this.validatedConfig.OAUTH2_LOGIN_URL,
      clients: this.validatedConfig.OAUTH2_CLIENTS,
    }
  }

  get noris() {
    return {
      host: this.validatedConfig.MSSQL_HOST,
      database: this.validatedConfig.MSSQL_DB,
      username: this.validatedConfig.MSSQL_USERNAME,
      password: this.validatedConfig.MSSQL_PASSWORD,
      port: this.validatedConfig.MSSQL_PORT,
    }
  }

  get pdfGenerator() {
    return {
      chromiumExecutablePath: this.validatedConfig.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    }
  }

  /**
   * Escape hatch for per-client dynamic environment variables (e.g. per-tenant OAuth2
   * client credentials, RSA public keys) whose names are only known at runtime and
   * therefore cannot be declared as static fields on EnvironmentVariables.
   */
  getDynamic(key: string): string | undefined {
    return process.env[key]
  }
}
