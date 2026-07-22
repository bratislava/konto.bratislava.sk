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
  NEST_CLAMAV_SCANNER_USERNAME: string

  @EnvString()
  NEST_CLAMAV_SCANNER_PASSWORD: string

  @EnvString()
  DATABASE_URL: string

  @EnvUrl(false)
  NEST_FORMS_BACKEND: string

  @EnvString()
  NEST_FORMS_BACKEND_USERNAME: string

  @EnvString()
  NEST_FORMS_BACKEND_PASSWORD: string

  @EnvString()
  CLAMAV_HOST: string

  @EnvPort()
  CLAMAV_PORT: number

  @EnvString()
  MINIO_ACCESS_KEY: string

  @EnvString()
  MINIO_ENDPOINT: string

  @EnvString()
  MINIO_HOST: string

  @EnvPort()
  MINIO_PORT: number

  @EnvString()
  MINIO_SECRET_KEY: string

  @EnvBoolean()
  MINIO_USE_SSL: boolean

  @EnvBoolean()
  MINIO_PATH_STYLE: boolean

  @EnvString()
  CLAMAV_UNSCANNED_BUCKET: string

  @EnvString()
  CLAMAV_SAFE_BUCKET: string

  @EnvString()
  CLAMAV_INFECTED_BUCKET: string

  @EnvInt(0)
  MAX_FILE_SCAN_RUNS: number

  @EnvInt(0)
  MAX_FILE_SCAN_RUNS_TIMEOUT: number

  @EnvInt(0)
  MAX_FILES_PER_REQUEST: number

  @EnvInt(0)
  MAX_FILE_SIZE: number

  @EnvString()
  MIMETYPE_WHITELIST: string
}
