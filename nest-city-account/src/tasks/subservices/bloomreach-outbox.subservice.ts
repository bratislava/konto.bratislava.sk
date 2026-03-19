import { Injectable } from '@nestjs/common'
import { LineLoggerSubservice } from '../../utils/subservices/line-logger.subservice'
import { PrismaService } from '../../prisma/prisma.service'
import { BloomreachService } from '../../bloomreach/bloomreach.service'

@Injectable()
export class BloomreachOutboxSubservice {
  private readonly logger: LineLoggerSubservice

  constructor(
    private readonly prismaService: PrismaService,
    private readonly bloomreachService: BloomreachService
  ) {
    this.logger = new LineLoggerSubservice(BloomreachOutboxSubservice.name)
  }

  async processBloomreachOutbox(): Promise<void> {
    const pending = await this.prismaService.bloomreachOutbox.findMany({
      where: {
        processedAt: null,
        attempts: { lt: 120 }, // give up after 120 attempts
      },
      orderBy: { createdAt: 'asc' },
      take: 50,
    })

    for (const event of pending) {
      let success: boolean | undefined = false
      try {
        const externalId = event.externalId
        if (event.eventType === 'TRACK_CUSTOMER') {
          success = await this.bloomreachService.trackCustomer(
            externalId,
            event.phoneNumber ?? undefined
          )
        }
        if (!success) {
          await this.prismaService.bloomreachOutbox.update({
            where: { id: event.id },
            data: {
              attempts: { increment: 1 },
              lastError: 'Failed to track customer',
            },
          })
          return
        }

        await this.prismaService.bloomreachOutbox.update({
          where: { id: event.id },
          data: { processedAt: new Date() },
        })
      } catch (error) {
        await this.prismaService.bloomreachOutbox.update({
          where: { id: event.id },
          data: {
            attempts: { increment: 1 },
            lastError: String(error),
          },
        })
      }
    }
  }
}
