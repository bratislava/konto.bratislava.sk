import { BaConfig } from './baConfig'
import { validate } from './env.validation'

export class BaConfigSingleton {
  private static instance: BaConfig | null = null

  private constructor() {}

  static getInstance(): BaConfig {
    if (!BaConfigSingleton.instance) {
      const validatedEnvVariables = validate(process.env)
      BaConfigSingleton.instance = new BaConfig(validatedEnvVariables)
    }

    return BaConfigSingleton.instance
  }
}

export const getConfigInstance = () => BaConfigSingleton.getInstance()
