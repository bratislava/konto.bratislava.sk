import { Logger } from '@nestjs/common'

// TODO move somewhere after refactor
export default function alertError(
  message: string,
  logger: Logger,
  error?: string,
): void {
  const errorResponse = {
    message,
    error,
    alert: 1,
  }

  logger.error(JSON.stringify(errorResponse))
}
