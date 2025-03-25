import BaConfig from './ba-config'
import validateEnvironmentVariables from './environment-variables.validate'

export default class BaConfigSingleton {
  private static instance: BaConfig | null = null

  static getInstance(): BaConfig {
    if (!BaConfigSingleton.instance) {
      const validatedEnvVariables = validateEnvironmentVariables(process.env)
      BaConfigSingleton.instance = new BaConfig(validatedEnvVariables)
    }

    return BaConfigSingleton.instance
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const getBaConfig = () => BaConfigSingleton.getInstance()
