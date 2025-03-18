import { plainToInstance } from 'class-transformer'
import { validateSync } from 'class-validator'

import { EnvironmentVariables } from './env.config'

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  })

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  })

  if (errors.length > 0) {
    console.error(errors.toString())
    throw new Error(`Environment validation failed: ${errors.toString()}`)
  }

  return validatedConfig
}
