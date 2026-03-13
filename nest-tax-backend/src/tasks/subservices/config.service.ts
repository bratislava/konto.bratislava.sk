import { Injectable } from '@nestjs/common'

import { PrismaService } from '../../prisma/prisma.service'
import {
  OVERPAYMENTS_LOOKBACK_DAYS,
  OVERPAYMENTS_LOOKBACK_DAYS_DEFAULT,
} from '../../utils/constants'
import { LineLoggerSubservice } from '../../utils/subservices/line-logger.subservice'

@Injectable()
export default class TasksConfigSubservice {
  private readonly logger: LineLoggerSubservice

  constructor(private readonly prismaService: PrismaService) {
    this.logger = new LineLoggerSubservice(TasksConfigSubservice.name)
  }

  async resetOverpaymentsLookbackDays(): Promise<void> {
    await this.prismaService.config.updateMany({
      where: {
        key: OVERPAYMENTS_LOOKBACK_DAYS,
      },
      data: {
        value: OVERPAYMENTS_LOOKBACK_DAYS_DEFAULT.toString(),
      },
    })
    this.logger.log(
      `Reset OVERPAYMENTS_LOOKBACK_DAYS to default value: ${OVERPAYMENTS_LOOKBACK_DAYS_DEFAULT}`,
    )
  }

  async incrementOverpaymentsLookbackDays(
    incrementBy: number = 1,
  ): Promise<void> {
    await this.prismaService.$transaction(async (tx) => {
      const config = await tx.config.findFirst({
        where: { key: OVERPAYMENTS_LOOKBACK_DAYS },
      })

      const currentValue = config ? parseInt(config.value, 10) : 0

      if (Number.isNaN(currentValue)) {
        throw new TypeError(
          `Invalid OVERPAYMENTS_LOOKBACK_DAYS configuration: ${config?.value ?? 'null'}, type number expected, got ${typeof config?.value}.`,
        )
      }

      const newValue = currentValue + incrementBy

      await tx.config.updateMany({
        where: { key: OVERPAYMENTS_LOOKBACK_DAYS },
        data: { value: newValue.toString() },
      })

      this.logger.log(
        `Incremented OVERPAYMENTS_LOOKBACK_DAYS from ${currentValue} to ${newValue}`,
      )

      return {
        currentValue,
        newValue,
      }
    })
  }
}
