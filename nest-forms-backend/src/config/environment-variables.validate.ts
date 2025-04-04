import { plainToInstance } from 'class-transformer'
import { validateSync } from 'class-validator'

import EnvironmentVariables from './environment-variables'

export default function validateEnvironmentVariables(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
    excludeExtraneousValues: true,
  })

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  })

  if (errors.length > 0) {
    throw new Error(`Environment validation failed: ${errors.toString()}`)
  }

  return validatedConfig
}
