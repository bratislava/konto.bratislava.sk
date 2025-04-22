import BaConfig from './ba-config'
import validateEnvironmentVariables from './environment-variables.validate'

let instance: BaConfig | null = null

export default function getBaConfigInstance(): BaConfig {
  if (!instance) {
    const validatedEnvVariables = validateEnvironmentVariables(process.env)
    instance = new BaConfig(validatedEnvVariables)
  }

  return instance
}
