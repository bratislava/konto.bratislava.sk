import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EnvironmentVariables } from 'env.config'

@Injectable()
export class AppConfigService {
  constructor(
    private configService: ConfigService<EnvironmentVariables, true>,
  ) {}

  // AWS Cognito
  get cognito() {
    return {
      clientId: this.configService.get('AWS_COGNITO_CLIENT_ID', {
        infer: true,
      }),
      userpoolId: this.configService.get('AWS_COGNITO_USERPOOL_ID', {
        infer: true,
      }),
      region: this.configService.get('AWS_COGNITO_REGION', { infer: true }),
      access: this.configService.get('AWS_COGNITO_ACCESS', { infer: true }),
      secret: this.configService.get('AWS_COGNITO_SECRET', { infer: true }),
    }
  }

  // Magproxy
  get magproxy() {
    return {
      url: this.configService.get('MAGPROXY_URL', { infer: true }),
      azure: {
        adUrl: this.configService.get('MAGPROXY_AZURE_AD_URL', { infer: true }),
        clientId: this.configService.get('MAGPROXY_AZURE_CLIENT_ID', {
          infer: true,
        }),
        clientSecret: this.configService.get('MAGPROXY_AZURE_CLIENT_SECRET', {
          infer: true,
        }),
        scope: this.configService.get('MAGPROXY_AZURE_SCOPE', { infer: true }),
      },
    }
  }

  // RabbitMQ
  get rabbitMqUri(): string {
    return this.configService.get('RABBIT_MQ_URI', { infer: true })
  }

  // Turnstile
  get turnstileSecret(): string {
    return this.configService.get('TURNSTILE_SECRET', { infer: true })
  }

  // Mailgun
  get mailgun() {
    return {
      apiKey: this.configService.get('MAILGUN_API_KEY', { infer: true }),
      defaultDomain: this.configService.get('DEFAULT_MAILGUN_DOMAIN', {
        infer: true,
      }),
    }
  }

  // Slovensko.sk
  get slovenskoSkContainerUri(): string {
    return this.configService.get('SLOVENSKO_SK_CONTAINER_URI', { infer: true })
  }

  // API Tokens
  get tokens() {
    return {
      apiTokenPrivate: this.configService.get('API_TOKEN_PRIVATE', {
        infer: true,
      }),
      oboTokenPublic: this.configService.get('OBO_TOKEN_PUBLIC', {
        infer: true,
      }),
      subNasesTechnicalAccount: this.configService.get(
        'SUB_NASES_TECHNICAL_ACCOUNT',
        { infer: true },
      ),
    }
  }

  // Bloomreach
  get bloomreach() {
    const integrationState = this.configService.get(
      'BLOOMREACH_INTEGRATION_STATE',
      { infer: true },
    )

    return {
      integrationState,
      isActive: integrationState === BloomreachIntegrationState.ACTIVE,
      projectToken: this.configService.get('BLOOMREACH_PROJECT_TOKEN', {
        infer: true,
      }),
      api: {
        key: this.configService.get('BLOOMREACH_API_KEY', { infer: true }),
        secret: this.configService.get('BLOOMREACH_API_SECRET', {
          infer: true,
        }),
        url: this.configService.get('BLOOMREACH_API_URL', { infer: true }),
      },
    }
  }

  // Tax Backend
  get taxBackend() {
    return {
      url: this.configService.get('TAX_BACKEND_URL', { infer: true }),
      apiKey: this.configService.get('TAX_BACKEND_API_KEY', { infer: true }),
    }
  }

  get adminAppSecret(): string {
    return this.configService.get('ADMIN_APP_SECRET', { infer: true })
  }

  get cryptoSecretKey(): string {
    return this.configService.get('CRYPTO_SECRET_KEY', { infer: true })
  }

  get port(): number {
    return this.configService.get('PORT', { infer: true })
  }

  // Database extended config
  get database() {
    return {
      url: this.databaseUrl,
      name: this.configService.get('POSTGRES_DB', { infer: true }),
      user: this.configService.get('POSTGRES_USER', { infer: true }),
      password: this.configService.get('POSTGRES_PASSWORD', { infer: true }),
    }
  }

  // Forms backend credentials
  get formsBackend() {
    return {
      username: this.configService.get('NEST_FORMS_BACKEND_USERNAME', {
        infer: true,
      }),
      password: this.configService.get('NEST_FORMS_BACKEND_PASSWORD', {
        infer: true,
      }),
    }
  }

  // Ginis API credentials
  get ginisApi() {
    return {
      username: this.configService.get('GINIS_USERNAME', { infer: true }),
      password: this.configService.get('GINIS_PASSWORD', { infer: true }),
    }
  }

  // JWT configuration
  get jwt() {
    return {
      secret: this.configService.get('JWT_SECRET', { infer: true }),
    }
  }

  // Scanner configuration
  get scanner() {
    return {
      username: this.configService.get('NEST_CLAMAV_SCANNER_USERNAME', {
        infer: true,
      }),
      password: this.configService.get('NEST_CLAMAV_SCANNER_PASSWORD', {
        infer: true,
      }),
    }
  }

  // SMTP configuration
  get smtp() {
    return {
      username: this.configService.get('OLO_SMTP_USERNAME', { infer: true }),
      password: this.configService.get('OLO_SMTP_PASSWORD', { infer: true }),
    }
  }

  // SharePoint configuration
  get sharepoint() {
    return {
      clientId: this.configService.get('SHAREPOINT_CLIENT_ID', { infer: true }),
      clientSecret: this.configService.get('SHAREPOINT_CLIENT_SECRET', {
        infer: true,
      }),
      tenantId: this.configService.get('SHAREPOINT_TENANT_ID', { infer: true }),
    }
  }
}
