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
}
