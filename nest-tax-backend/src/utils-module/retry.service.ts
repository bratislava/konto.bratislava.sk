import { Injectable, Logger } from '@nestjs/common'

import { toLogfmt } from '../utils/logging'

@Injectable()
export class RetryService {
  private readonly logger: Logger

  constructor() {
    this.logger = new Logger('RetryService')
  }

  async retryWithDelay<T>(
    fn: () => Promise<T>,
    functionName: string,
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
        `Retry attempt failed for function ${functionName}. Retrying in ${(delayMs / 1000).toFixed(2)} seconds. Remaining retries: ${retries - 1}`,
        toLogfmt(error),
      )
      await new Promise<void>((resolve) => {
        setTimeout(resolve, delayMs)
      })
      return this.retryWithDelay(fn, functionName, retries - 1, delayMs)
    }
  }
}
