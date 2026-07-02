import EnvironmentVariables from './environment-variables'

export default class BaConfig {
  constructor(protected validatedConfig: EnvironmentVariables) {}

  get environment() {
    return {
      nodeEnv: this.validatedConfig.NODE_ENV,
      clusterEnv: this.validatedConfig.CLUSTER_ENV,
    }
  }
}
