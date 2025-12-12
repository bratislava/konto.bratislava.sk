import { Injectable, Logger } from '@nestjs/common'

import { toLogfmt } from '../logging'

@Injectable()
export class RetrySubservice {
  private readonly logger: Logger

  constructor() {
    this.logger = new Logger('RetrySubservice')
  }

  async retryWithDelay<T>(
    fn: () => Promise<T>,
    retries = 3,
    delayMs = 5 * 60 * 1000, // 5 minutes
  ): Promise<T> {
    try {
      return await fn()
    } catch (error) {
      if (retries <= 0) {
        throw error
      }
      this.logger.warn(
        `Retry attempt failed. Retrying in ${(delayMs / 1000).toFixed(2)} seconds. Remaining retries: ${retries - 1}`,
        toLogfmt(error),
      )
      await new Promise<void>((resolve) => {
        setTimeout(resolve, delayMs)
      })
      return this.retryWithDelay(fn, retries - 1, delayMs)
    }
  }
}
