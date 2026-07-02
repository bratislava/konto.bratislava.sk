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

  get cognito() {
    return {
      userPoolId: this.validatedConfig.COGNITO_USER_POOL_ID,
      clientId: this.validatedConfig.COGNITO_CLIENT_ID,
      region: this.validatedConfig.COGNITO_REGION,
      accessKeyId: this.validatedConfig.AWS_COGNITO_ACCESS,
      secretAccessKey: this.validatedConfig.AWS_COGNITO_SECRET,
    }
  }

  get cityAccountBackend() {
    return {
      url: this.validatedConfig.CITY_ACCOUNT_API_URL,
      adminApiKey: this.validatedConfig.CITY_ACCOUNT_ADMIN_API_KEY,
    }
  }

  get smtp() {
    return {
      smtpUsername: this.validatedConfig.AWS_SES_SMTP_USERNAME,
      smtpPassword: this.validatedConfig.AWS_SES_SMTP_PASSWORD,
      senderEmail: this.validatedConfig.AWS_SES_SENDER_EMAIL,
    }
  }

  get noris() {
    return {
      host: this.validatedConfig.MSSQL_HOST,
      database: this.validatedConfig.MSSQL_DB,
      username: this.validatedConfig.MSSQL_USERNAME,
      password: this.validatedConfig.MSSQL_PASSWORD,
    }
  }

  get bloomreach() {
    return {
      apiUrl: this.validatedConfig.BLOOMREACH_API_URL,
      apiKey: this.validatedConfig.BLOOMREACH_API_KEY,
      apiSecret: this.validatedConfig.BLOOMREACH_API_SECRET,
      projectToken: this.validatedConfig.BLOOMREACH_PROJECT_TOKEN,
    }
  }

  get qrCode() {
    return {
      beneficiaryName: this.validatedConfig.PAYMENT_QR_BENEFICIARY_NAME,
    }
  }

  get paygate() {
    return {
      currency: this.validatedConfig.PAYGATE_CURRENCY,
      paymentRedirectUrl: this.validatedConfig.PAYGATE_PAYMENT_REDIRECT_URL,
      redirectUrl: this.validatedConfig.PAYGATE_REDIRECT_URL,
      afterPaymentRedirectFrontend:
        this.validatedConfig.PAYGATE_AFTER_PAYMENT_REDIRECT_FRONTEND,
      dzn: {
        key: this.validatedConfig.PAYGATE_KEY,
        signCert: this.validatedConfig.PAYGATE_SIGN_CERT,
        merchantNumber: this.validatedConfig.PAYGATE_MERCHANT_NUMBER,
        passphrase: this.validatedConfig.PAYGATE_PASSPHRASE,
      },
      ko: {
        key: this.validatedConfig.PAYGATE_KEY_KO,
        signCert: this.validatedConfig.PAYGATE_SIGN_CERT_KO,
        merchantNumber: this.validatedConfig.PAYGATE_MERCHANT_NUMBER_KO,
        passphrase: this.validatedConfig.PAYGATE_PASSPHRASE_KO,
      },
    }
  }

  get cardPaymentReporting() {
    return {
      ico: this.validatedConfig.REPORTING_ICO,
      sftp: {
        host: this.validatedConfig.REPORTING_SFTP_HOST,
        port: this.validatedConfig.REPORTING_SFTP_PORT,
        username: this.validatedConfig.REPORTING_SFTP_USER,
        privateKey: this.validatedConfig.REPORTING_SFTP_KEY,
      },
      dzn: {
        fileName: this.validatedConfig.REPORTING_FILE_NAME,
        accountId: this.validatedConfig.REPORTING_ACCOUNT_ID,
        bankId: this.validatedConfig.REPORTING_BANK_ID,
        sftpFilesPath: this.validatedConfig.REPORTING_SFTP_FILES_PATH,
      },
      ko: {
        fileName: this.validatedConfig.REPORTING_PKO_FILE_NAME,
        accountId: this.validatedConfig.REPORTING_PKO_ACCOUNT_ID,
        bankId: this.validatedConfig.REPORTING_PKO_BANK_ID,
        sftpFilesPath: this.validatedConfig.REPORTING_PKO_SFTP_FILES_PATH,
      },
    }
  }

  get featureToggles() {
    return {
      updateTaxesFromNoris:
        this.validatedConfig.FEATURE_TOGGLE_UPDATE_TAXES_FROM_NORIS,
      sendBloomreachEvents:
        this.validatedConfig.FEATURE_TOGGLE_SEND_BLOOMREACH_EVENTS,
    }
  }
}
