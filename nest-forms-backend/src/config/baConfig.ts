import { Injectable } from '@nestjs/common'
import {
  BloomreachIntegrationState,
  EnvironmentVariables,
} from 'src/config/env.config'

@Injectable()
export class BaConfig {
  constructor(private validatedConfig: EnvironmentVariables) {}

  // AWS Cognito
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

  get rabbitMqUri(): string {
    return this.validatedConfig.RABBIT_MQ_URI
  }

  get turnstileSecret(): string {
    return this.validatedConfig.TURNSTILE_SECRET
  }

  get mailgun() {
    return {
      apiKey: this.validatedConfig.MAILGUN_API_KEY,
      defaultDomain: this.validatedConfig.DEFAULT_MAILGUN_DOMAIN,
    }
  }

  get slovenskoSkContainerUri(): string {
    return this.validatedConfig.SLOVENSKO_SK_CONTAINER_URI
  }

  // API Tokens
  get tokens() {
    return {
      apiTokenPrivate: this.validatedConfig.API_TOKEN_PRIVATE,
      oboTokenPublic: this.validatedConfig.OBO_TOKEN_PUBLIC,
      subNasesTechnicalAccount:
        this.validatedConfig.SUB_NASES_TECHNICAL_ACCOUNT,
    }
  }

  get bloomreach() {
    const integrationState = this.validatedConfig.BLOOMREACH_INTEGRATION_STATE

    return {
      integrationState,
      isActive: integrationState === BloomreachIntegrationState.ACTIVE,
      projectToken: this.validatedConfig.BLOOMREACH_PROJECT_TOKEN,
      api: {
        key: this.validatedConfig.BLOOMREACH_API_KEY,
        secret: this.validatedConfig.BLOOMREACH_API_SECRET,
        url: this.validatedConfig.BLOOMREACH_API_URL,
      },
    }
  }

  get taxBackend() {
    return {
      url: this.validatedConfig.TAX_BACKEND_URL,
      apiKey: this.validatedConfig.TAX_BACKEND_API_KEY,
    }
  }

  get adminAppSecret(): string {
    return this.validatedConfig.ADMIN_APP_SECRET
  }

  get cryptoSecretKey(): string {
    return this.validatedConfig.CRYPTO_SECRET_KEY
  }

  get port(): number {
    return this.validatedConfig.PORT
  }

  get database() {
    return {
      url: this.validatedConfig.DATABASE_URL,
      name: this.validatedConfig.POSTGRES_DB,
      user: this.validatedConfig.POSTGRES_USER,
      password: this.validatedConfig.POSTGRES_PASSWORD,
    }
  }

  get formsBackend() {
    return {
      username: this.validatedConfig.NEST_FORMS_BACKEND_USERNAME,
      password: this.validatedConfig.NEST_FORMS_BACKEND_PASSWORD,
    }
  }

  get ginisApi() {
    return {
      username: this.validatedConfig.GINIS_USERNAME,
      password: this.validatedConfig.GINIS_PASSWORD,
    }
  }

  get jwt() {
    return {
      secret: this.validatedConfig.JWT_SECRET,
    }
  }

  get scanner() {
    return {
      username: this.validatedConfig.NEST_CLAMAV_SCANNER_USERNAME,
      password: this.validatedConfig.NEST_CLAMAV_SCANNER_PASSWORD,
    }
  }

  get smtp() {
    return {
      username: this.validatedConfig.OLO_SMTP_USERNAME,
      password: this.validatedConfig.OLO_SMTP_PASSWORD,
    }
  }

  get sharepoint() {
    return {
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
      useSSL: this.validatedConfig.MINIO_USE_SSL === 'true',
      buckets: {
        unscanned: this.validatedConfig.MINIO_UNSCANNED_BUCKET,
        safe: this.validatedConfig.MINIO_SAFE_BUCKET,
        infected: this.validatedConfig.MINIO_INFECTED_BUCKET,
      },
    }
  }
}
