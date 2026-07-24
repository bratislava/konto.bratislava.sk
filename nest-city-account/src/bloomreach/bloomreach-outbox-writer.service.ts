import { Injectable } from '@nestjs/common'

import { BloomreachCommandName, BloomreachOutboxStatus } from '../generated/prisma/enums'
import { PrismaService } from '../prisma/prisma.service'
import { ErrorsEnum } from '../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { toLogfmt } from '../utils/logging'
import {
  BloomreachCustomerCommandData,
  BloomreachEventCommandData,
  Consent,
  isBloomreachEventCommandData,
} from './bloomreach.types'
import { BloomreachPayloadBuilder } from './bloomreach-payload.builder'
import {
  isAnonymizationCommand,
  isBloomreachOutboxDedupConflictError,
  isExistingHigherPriorityEventCommand,
  mergeCustomerCommandData,
} from './utils/merge-commands.utils'
import { lockOutboxDedupKey } from './utils/outbox-lock.utils'

@Injectable()
export class BloomreachOutboxWriterService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly payloadBuilder: BloomreachPayloadBuilder,
    private readonly throwerErrorGuard: ThrowerErrorGuard
  ) {}

  async queueCustomerCommand(externalId: string, phoneNumber?: string): Promise<void> {
    const { commandData } = await this.payloadBuilder.buildCustomerCommand(externalId, phoneNumber)

    await this.upsertPendingCustomerCommand(externalId, commandData)
  }

  async queueAnonymizeCommand(externalId: string): Promise<void> {
    const { commandData } = this.payloadBuilder.buildAnonymizeCommand(externalId)

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
}
