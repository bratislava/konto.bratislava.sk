import EnvironmentVariables from './environment-variables'

export default class BaConfig {
  constructor(protected validatedConfig: EnvironmentVariables) {}

  /* eslint-disable @typescript-eslint/explicit-function-return-type */
  get environment() {
    return {
      nodeEnv: this.validatedConfig.NODE_ENV,
      clusterEnv: this.validatedConfig.CLUSTER_ENV,
    }
  }

  get self() {
    return {
      url: this.validatedConfig.SELF_URL,
      port: this.validatedConfig.PORT,
      username: this.validatedConfig.NEST_FORMS_BACKEND_USERNAME,
      password: this.validatedConfig.NEST_FORMS_BACKEND_PASSWORD,
    }
  }

  get database() {
    return {
      url: this.validatedConfig.DATABASE_URL,
    }
  }

  get tokens() {
    return {
      adminAppSecret: this.validatedConfig.ADMIN_APP_SECRET,
      jwtSecret: this.validatedConfig.JWT_SECRET,
    }
  }

  get cognito() {
    return {
      clientId: this.validatedConfig.AWS_COGNITO_CLIENT_ID,
      userpoolId: this.validatedConfig.AWS_COGNITO_USERPOOL_ID,
      region: this.validatedConfig.AWS_COGNITO_REGION,
      access: this.validatedConfig.AWS_COGNITO_ACCESS,
      secret: this.validatedConfig.AWS_COGNITO_SECRET,
    }
  }

  get rabbitMq() {
    return {
      uri: this.validatedConfig.RABBIT_MQ_URI,
    }
  }

  get mailgun() {
    return {
      apiKey: this.validatedConfig.MAILGUN_API_KEY,
      domain: this.validatedConfig.MAILGUN_DOMAIN,
      host: this.validatedConfig.MAILGUN_HOST,
      emailFrom: this.validatedConfig.MAILGUN_EMAIL_FROM,
    }
  }

  get slovenskoSk() {
    return {
      url: this.validatedConfig.SLOVENSKO_SK_CONTAINER_URI,
      apiKey: this.validatedConfig.API_TOKEN_PRIVATE,
      apiTokenPrivate: this.validatedConfig.API_TOKEN_PRIVATE,
      oboTokenPublic: this.validatedConfig.OBO_TOKEN_PUBLIC,
      subNasesTechnicalAccount:
        this.validatedConfig.SUB_NASES_TECHNICAL_ACCOUNT,
      nasesSenderUri: this.validatedConfig.NASES_SENDER_URI,
      nasesRecipientUri: this.validatedConfig.NASES_RECIPIENT_URI,
    }
  }

  get frontend() {
    return {
      url: this.validatedConfig.FRONTEND_URL,
    }
  }

  get cityAccountBackend() {
    return {
      url: this.validatedConfig.USER_ACCOUNT_API,
    }
  }

  get scannerBackend() {
    return {
      url: this.validatedConfig.NEST_CLAMAV_SCANNER,
      username: this.validatedConfig.NEST_CLAMAV_SCANNER_USERNAME,
      password: this.validatedConfig.NEST_CLAMAV_SCANNER_PASSWORD,
    }
  }

  get ginisApi() {
    return {
      username: this.validatedConfig.GINIS_USERNAME,
      password: this.validatedConfig.GINIS_PASSWORD,
      sslHost: this.validatedConfig.GINIS_SSL_HOST,
      ginHost: this.validatedConfig.GINIS_GIN_HOST,
    }
  }

  get olo() {
    return {
      smtp: {
        username: this.validatedConfig.OLO_SMTP_USERNAME,
        password: this.validatedConfig.OLO_SMTP_PASSWORD,
      },
      frontendUrl: this.validatedConfig.OLO_FRONTEND_URL,
    }
  }

  get sharepoint() {
    return {
      domain: this.validatedConfig.SHAREPOINT_DOMAIN,
      url: this.validatedConfig.SHAREPOINT_URL,
      clientId: this.validatedConfig.SHAREPOINT_CLIENT_ID,
      clientSecret: this.validatedConfig.SHAREPOINT_CLIENT_SECRET,
      tenantId: this.validatedConfig.SHAREPOINT_TENANT_ID,
    }
  }

  get minio() {
    return {
      accessKey: this.validatedConfig.MINIO_ACCESS_KEY,
      endpoint: this.validatedConfig.MINIO_ENDPOINT,
      host: this.validatedConfig.MINIO_HOST,
      port: this.validatedConfig.MINIO_PORT,
      secretKey: this.validatedConfig.MINIO_SECRET_KEY,
      useSSL: this.validatedConfig.MINIO_USE_SSL,
      buckets: {
        unscanned: this.validatedConfig.MINIO_UNSCANNED_BUCKET,
        safe: this.validatedConfig.MINIO_SAFE_BUCKET,
        infected: this.validatedConfig.MINIO_INFECTED_BUCKET,
      },
    }
  }

  get redis() {
    return {
      service: this.validatedConfig.REDIS_SERVICE,
      port: this.validatedConfig.REDIS_PORT,
      username: this.validatedConfig.REDIS_USER,
      password: this.validatedConfig.REDIS_PASSWORD,
      taxJob: {
        concurrency: this.validatedConfig.TAX_PDF_JOB_CONCURRENCY,
        timeout: this.validatedConfig.TAX_PDF_JOB_TIMEOUT,
      },
    }
  }

  get featureToggles() {
    return {
      versioning: this.validatedConfig.FEATURE_TOGGLE_VERSIONING,
    }
  }
  /* eslint-enable @typescript-eslint/explicit-function-return-type */
}
