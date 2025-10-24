import { Injectable, Logger } from '@nestjs/common'

import { PrismaService } from '../../prisma/prisma.service'
import { OVERPAYMENTS_LOOKBACK_DAYS_DEFAULT } from '../../utils/constants'

@Injectable()
export default class ConfigSubservice {
  private readonly logger: Logger

  constructor(private readonly prismaService: PrismaService) {
    this.logger = new Logger('ConfigSubservice')
  }

  async resetOverpaymentsLookbackDays(): Promise<void> {
    await this.prismaService.config.updateMany({
      where: {
        key: 'OVERPAYMENTS_LOOKBACK_DAYS',
      },
      data: {
        value: OVERPAYMENTS_LOOKBACK_DAYS_DEFAULT.toString(),
      },
    })
    this.logger.log(
      `Reset OVERPAYMENTS_LOOKBACK_DAYS to default value: ${OVERPAYMENTS_LOOKBACK_DAYS_DEFAULT}`,
    )
  }

  async incrementOverpaymentsLookbackDays(lookbackDays: number): Promise<void> {
    const newDays = lookbackDays + 1

    await this.prismaService.config.updateMany({
      where: {
        key: 'OVERPAYMENTS_LOOKBACK_DAYS',
      },
      data: {
        value: newDays.toString(),
      },
    })

    this.logger.log(
      `Incremented OVERPAYMENTS_LOOKBACK_DAYS from ${lookbackDays} to ${newDays}`,
    )
  }
}
