import { Injectable } from '@nestjs/common'

import { BloomreachCommandName, BloomreachOutboxStatus } from '../generated/prisma/enums'
import { PrismaService } from '../prisma/prisma.service'
import { ErrorsEnum } from '../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { toLogfmt } from '../utils/logging'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import {
  BloomreachCustomerCommandData,
  BloomreachEventCommandData,
  BloomreachEventNameEnum,
  Consent,
  isBloomreachEventCommandData,
} from './bloomreach.types'
import { BloomreachPayloadBuilder } from './bloomreach-payload.builder'
import {
  isAnonymizationCommand,
  isExistingHigherPriorityEventCommand,
  mergeCustomerCommandData,
} from './utils/merge-commands.utils'
import {
  isDuplicatePendingCustomerError,
  isDuplicatePendingEventError,
  isTerminalDowngradeError,
  isTerminalOverrideError,
} from './utils/outbox-errors.utils'
import { lockTransactionWithKey } from './utils/outbox-lock.utils'

@Injectable()
export class BloomreachOutboxWriterService {
  private readonly logger: LineLoggerSubservice

  constructor(
    private readonly prisma: PrismaService,
    private readonly payloadBuilder: BloomreachPayloadBuilder,
    private readonly throwerErrorGuard: ThrowerErrorGuard
  ) {
    this.logger = new LineLoggerSubservice(BloomreachOutboxWriterService.name)
  }

  async queueCustomerCommand(externalId: string, phoneNumber?: string): Promise<void> {
    const { commandData } = await this.payloadBuilder.buildCustomerCommand(externalId, phoneNumber)

    await this.upsertPendingCustomerCommand(externalId, commandData)
  }

  async queueAnonymizeCommand(externalId: string, timestamp: number): Promise<void> {
    const { commandData } = this.payloadBuilder.buildAnonymizeCommand(externalId, timestamp)

    await this.upsertPendingCustomerCommand(externalId, commandData)
  }

  async queueConsentEvents(
    consents: Consent[],
    externalId: string,
    terminal = false
  ): Promise<void> {
    const commands = this.payloadBuilder.buildConsentEventCommands(consents, externalId)

    await Promise.all(
      commands.map(async ({ commandData }) =>
        this.upsertPendingEventCommand(externalId, commandData, terminal)
      )
    )
  }

  private async upsertPendingEventCommand(
    externalId: string,
    commandData: BloomreachEventCommandData,
    terminal: boolean
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await lockTransactionWithKey(
        tx,
        externalId,
        BloomreachCommandName.CUSTOMERS_EVENTS,
        commandData.event_type,
        commandData.properties.category
      )

      const existing = await tx.bloomreachOutbox.findFirst({
        where: {
          externalId,
          commandName: BloomreachCommandName.CUSTOMERS_EVENTS,
          status: BloomreachOutboxStatus.PENDING,
          AND: [
            {
              commandData: {
                path: ['event_type'],
                equals: commandData.event_type,
              },
            },
            {
              commandData: {
                path: ['properties', 'category'],
                equals: commandData.properties.category,
              },
            },
          ],
        },
      })

      const eventContext = {
        externalId,
        eventType: commandData.event_type,
        category: commandData.properties.category,
      }

      if (!existing) {
        try {
          await tx.bloomreachOutbox.create({
            data: {
              externalId,
              commandName: BloomreachCommandName.CUSTOMERS_EVENTS,
              commandData,
              isTerminal: terminal,
            },
          })
        } catch (error) {
          this.handleEventCreateFailure(error, eventContext)
        }
        return
      }

      if (!isBloomreachEventCommandData(existing.commandData)) {
        throw this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          'Bloomreach outbox entry has commandName CUSTOMERS_EVENTS but commandData is not event command data',
          toLogfmt({ externalId, entryId: existing.id })
        )
      }

      const existingData = existing.commandData

      if (
        isExistingHigherPriorityEventCommand(
          { isTerminal: existing.isTerminal, timestamp: existingData.timestamp },
          { isTerminal: terminal, timestamp: commandData.timestamp }
        )
      ) {
        return
      }

      try {
        await tx.bloomreachOutbox.update({
          where: { id: existing.id },
          data: {
            commandData,
            isTerminal: terminal,
          },
        })
      } catch (error) {
        this.handleEventDowngradeFailure(error, eventContext)
      }
    })
  }

  private async upsertPendingCustomerCommand(
    externalId: string,
    commandData: BloomreachCustomerCommandData
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await lockTransactionWithKey(tx, externalId, BloomreachCommandName.CUSTOMERS)

      const existing = await tx.bloomreachOutbox.findFirst({
        where: {
          externalId,
          commandName: BloomreachCommandName.CUSTOMERS,
          status: BloomreachOutboxStatus.PENDING,
        },
      })

      if (!existing) {
        try {
          await tx.bloomreachOutbox.create({
            data: {
              externalId,
              commandName: BloomreachCommandName.CUSTOMERS,
              commandData,
              isTerminal: isAnonymizationCommand(commandData),
            },
          })
        } catch (error) {
          this.handleCustomerCreateFailure(error, externalId)
        }
      }

      const merged = mergeCustomerCommandData(
        existing.commandData as BloomreachCustomerCommandData,
        commandData
      )

      try {
        await tx.bloomreachOutbox.update({
          where: { id: existing.id },
          data: {
            commandData: merged,
            isTerminal: isAnonymizationCommand(merged),
          },
        })
      } catch (error) {
        this.handleCustomerDowngradeFailure(error, externalId)
      }
    })
  }

  private handleEventDowngradeFailure(
    error: unknown,
    context: { externalId: string; eventType: BloomreachEventNameEnum; category: string }
  ): void {
    if (!isTerminalDowngradeError(error)) {
      throw error
    }
    throw this.throwerErrorGuard.InternalServerErrorException(
      ErrorsEnum.INTERNAL_SERVER_ERROR,
      'Attempted to downgrade a terminal outbox entry - isExistingHigherPriorityEventCommand should have prevented this, investigate',
      toLogfmt(context),
      error
    )
  }

  private handleEventCreateFailure(
    error: unknown,
    context: { externalId: string; eventType: BloomreachEventNameEnum; category: string }
  ): void {
    if (isTerminalOverrideError(error)) {
      this.logger.warn(
        `Skipped queuing consent event - a terminal entry for this dedup key is at least as recent, ${toLogfmt(
          context
        )}`
      )
      return
    }

    if (!isDuplicatePendingEventError(error)) {
      throw error
    }
    throw this.throwerErrorGuard.InternalServerErrorException(
      ErrorsEnum.INTERNAL_SERVER_ERROR,
      'bloomreach_outbox_events_pending_key violated - lockOutboxDedupKey should have prevented this, investigate a locking bug',
      toLogfmt(context),
      error
    )
  }

  private handleCustomerDowngradeFailure(error: unknown, externalId: string): void {
    if (!isTerminalDowngradeError(error)) {
      throw error
    }
    throw this.throwerErrorGuard.InternalServerErrorException(
      ErrorsEnum.INTERNAL_SERVER_ERROR,
      'Attempted to downgrade a terminal outbox entry - mergeCustomerCommandData should have prevented this, investigate',
      toLogfmt({ externalId }),
      error
    )
  }

  private handleCustomerCreateFailure(error: unknown, externalId: string): void {
    if (isTerminalOverrideError(error)) {
      this.logger.warn(
        `Skipped queuing customer command - a terminal entry for this dedup key is at least as recent`,
        { externalId }
      )
      return
    }

    if (!isDuplicatePendingCustomerError(error)) {
      throw error
    }
    throw this.throwerErrorGuard.InternalServerErrorException(
      ErrorsEnum.INTERNAL_SERVER_ERROR,
      'bloomreach_outbox_customers_pending_key violated - lockOutboxDedupKey should have prevented this, investigate a locking bug',
      toLogfmt({ externalId }),
      error
    )
  }
}
