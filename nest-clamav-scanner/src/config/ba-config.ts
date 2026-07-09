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
      username: this.validatedConfig.NEST_CLAMAV_SCANNER_USERNAME,
      password: this.validatedConfig.NEST_CLAMAV_SCANNER_PASSWORD,
    }
  }

  get database() {
    return {
      url: this.validatedConfig.DATABASE_URL,
    }
  }

  get formsBackend() {
    return {
      url: this.validatedConfig.NEST_FORMS_BACKEND,
      username: this.validatedConfig.NEST_FORMS_BACKEND_USERNAME,
      password: this.validatedConfig.NEST_FORMS_BACKEND_PASSWORD,
    }
  }

  get clamav() {
    return {
      host: this.validatedConfig.CLAMAV_HOST,
      port: this.validatedConfig.CLAMAV_PORT,
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
      pathStyle: this.validatedConfig.MINIO_PATH_STYLE,
      buckets: {
        unscanned: this.validatedConfig.CLAMAV_UNSCANNED_BUCKET,
        safe: this.validatedConfig.CLAMAV_SAFE_BUCKET,
        infected: this.validatedConfig.CLAMAV_INFECTED_BUCKET,
      },
    }
  }

  get scanner() {
    return {
      maxFileScanRuns: this.validatedConfig.MAX_FILE_SCAN_RUNS,
      maxFileScanRunsTimeout: this.validatedConfig.MAX_FILE_SCAN_RUNS_TIMEOUT,
      maxFilesPerRequest: this.validatedConfig.MAX_FILES_PER_REQUEST,
    }
  }

  get fileLimits() {
    return {
      maxSingleSizeGlobal: this.validatedConfig.MAX_FILE_SIZE,
    }
  }

  get files() {
    return {
      mimeTypeWhitelist: this.validatedConfig.MIMETYPE_WHITELIST,
    }
  }
}
