/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Injectable } from '@nestjs/common'
import { EnvironmentVariables } from 'src/config/env.config'

@Injectable()
export class BaConfig {
  constructor(private validatedConfig: EnvironmentVariables) {}

  get environment() {
    return {
      nodeEnv: this.validatedConfig.NODE_ENV,
      clusterEnv: this.validatedConfig.CLUSTER_ENV,
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

  get magproxy() {
    return {
      url: this.validatedConfig.MAGPROXY_URL,
      azure: {
        adUrl: this.validatedConfig.MAGPROXY_AZURE_AD_URL,
        clientId: this.validatedConfig.MAGPROXY_AZURE_CLIENT_ID,
        clientSecret: this.validatedConfig.MAGPROXY_AZURE_CLIENT_SECRET,
        scope: this.validatedConfig.MAGPROXY_AZURE_SCOPE,
      },
    }
  }

  get rabbitMq() {
    return {
      uri: this.validatedConfig.RABBIT_MQ_URI,
    }
  }

  get turnstile() {
    return {
      secret: this.validatedConfig.TURNSTILE_SECRET,
    }
  }

  get mailgun() {
    return {
      apiKey: this.validatedConfig.MAILGUN_API_KEY,
      defaultDomain: this.validatedConfig.DEFAULT_MAILGUN_DOMAIN,
      domain: this.validatedConfig.MAILGUN_DOMAIN,
      host: this.validatedConfig.MAILGUN_HOST,
      emailFrom: this.validatedConfig.MAILGUN_EMAIL_FROM,
    }
  }

  get slovenskoSk() {
    return {
      url: this.validatedConfig.SLOVENSKO_SK_CONTAINER_URI,
      apiKey: this.validatedConfig.API_TOKEN_PRIVATE,
      oboTokenPublic: this.validatedConfig.OBO_TOKEN_PUBLIC,
      subNasesTechnicalAccount:
        this.validatedConfig.SUB_NASES_TECHNICAL_ACCOUNT,
      nasesSenderUri: this.validatedConfig.NASES_SENDER_URI,
      nasesRecipientUri: this.validatedConfig.NASES_RECIPIENT_URI,
    }
  }

  get tokens() {
    return {
      apiTokenPrivate: this.validatedConfig.API_TOKEN_PRIVATE,
      oboTokenPublic: this.validatedConfig.OBO_TOKEN_PUBLIC,
      subNasesTechnicalAccount:
        this.validatedConfig.SUB_NASES_TECHNICAL_ACCOUNT,
      adminAppSecret: this.validatedConfig.ADMIN_APP_SECRET,
      cryptoSecretKey: this.validatedConfig.CRYPTO_SECRET_KEY,
      jwtSecret: this.validatedConfig.JWT_SECRET,
    }
  }

  get bloomreach() {
    return {
      integrationState: this.validatedConfig.BLOOMREACH_INTEGRATION_STATE,
      projectToken: this.validatedConfig.BLOOMREACH_PROJECT_TOKEN,
      api: {
        key: this.validatedConfig.BLOOMREACH_API_KEY,
        secret: this.validatedConfig.BLOOMREACH_API_SECRET,
        url: this.validatedConfig.BLOOMREACH_API_URL,
      },
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
      name: this.validatedConfig.POSTGRES_DB,
      user: this.validatedConfig.POSTGRES_USER,
      password: this.validatedConfig.POSTGRES_PASSWORD,
    }
  }

  get frontend() {
    return {
      url: this.validatedConfig.FRONTEND_URL,
    }
  }

  get taxBackend() {
    return {
      url: this.validatedConfig.TAX_BACKEND_URL,
      apiKey: this.validatedConfig.TAX_BACKEND_API_KEY,
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

  get httpBasic() {
    return {
      user: this.validatedConfig.HTTP_BASIC_USER,
      pass: this.validatedConfig.HTTP_BASIC_PASS,
    }
  }

  get taxRedis() {
    return {
      user: this.validatedConfig.REDIS_USER,
      password: this.validatedConfig.REDIS_PASSWORD,
      port: this.validatedConfig.REDIS_PORT,
      jobConcurrency: this.validatedConfig.TAX_PDF_JOB_CONCURRENCY,
      jobTimeout: this.validatedConfig.TAX_PDF_JOB_TIMEOUT,
    }
  }

  get featureToggles() {
    return {
      versioning: this.validatedConfig.FEATURE_TOGGLE_VERSIONING,
    }
  }
}
