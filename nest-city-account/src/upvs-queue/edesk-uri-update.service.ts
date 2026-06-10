import { Injectable } from '@nestjs/common'
import { QueueItemStatusEnum } from '@prisma/client'

import { NasesService } from '../nases/nases.service'
import { PrismaService } from '../prisma/prisma.service'
import { ErrorsEnum } from '../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import { selectUriToUpdateInternal } from './upvs-queue.queries'

@Injectable()
export class EdeskUriUpdateService {
  private readonly logger = new LineLoggerSubservice(EdeskUriUpdateService.name)

  constructor(
    private readonly prismaService: PrismaService,
    private readonly nasesService: NasesService,
    private readonly throwerErrorGuard: ThrowerErrorGuard
  ) {}

  async getUriToUpdateInternal() {
    return selectUriToUpdateInternal(this.prismaService)
  }

  async getUriToUpdateExternal() {
    return await this.prismaService.externalEdeskCheck.findFirst({
      where: {
        queueStatus: QueueItemStatusEnum.NEW_URI_CHECK_REQUIRED,
        uri: {
          not: null,
        },
      },
      orderBy: { updatedAt: 'asc' },
      select: {
        uri: true,
      },
    })
  }

  async handleUriUpdateInternal(input: { uri: string; id: string }) {
    const upvsResult = await this.nasesService.createMany([input])
    if (
      upvsResult.success.length === 1 &&
      upvsResult.success[0].data.uri &&
      upvsResult.success[0].physicalEntityId
    ) {
      const successItem = upvsResult.success[0]
      await this.prismaService.physicalEntity.update({
        where: { id: successItem.physicalEntityId! },
        data: {
          uri: successItem.data.uri,
        },
      })
    } else {
      const confirmedFailed = upvsResult.failed.some(
        (item) => item.inputUri === input.uri && !item.possibleUriChange
      )
      await this.prismaService.physicalEntity.update({
        where: { id: input.id },
        data: {
          uriPossiblyOutdated: !confirmedFailed,
          activeEdeskUpdateFailedAt: new Date(),
          activeEdeskUpdateFailCount: { increment: 1 },
        },
      })
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        `Failed to update URI for physical entity id ${input.id}`
      )
    }
  }

  async handleUriUpdateExternal(uri: string) {
    const upvsResult = await this.nasesService.createMany([{ uri }])
    if (upvsResult.success.length === 1) {
      const successItem = upvsResult.success[0]
      await this.prismaService.externalEdeskCheck.update({
        where: { uri: successItem.inputUri },
        data: {
          queueStatus: QueueItemStatusEnum.COMPLETED,
          upvsStatus: successItem.data.status ?? null,
          edeskStatus: successItem.data.upvs?.edesk_status ?? null,
          edeskNumber: successItem.data.upvs?.edesk_number ?? null,
          processedAt: new Date(),
        },
      })
    } else {
      await this.prismaService.externalEdeskCheck.update({
        where: { uri },
        data: {
          queueStatus: QueueItemStatusEnum.FAILED,
          failCount: { increment: 1 },
        },
      })
    }
  }
}
