import { Injectable } from '@nestjs/common'

import { PrismaService } from '../../prisma/prisma.service'
import { ErrorsEnum, ErrorsResponseEnum } from '../guards/dtos/error.dto'
import ThrowerErrorGuard from '../guards/errors.guard'

@Injectable()
export default class DatabaseSubservice {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
  ) {}

  async getConfigByKeys<T extends string>(
    requiredKeys: T[],
  ): Promise<{ [K in T]: string }> {
    let constants: Record<string, string>
    try {
      const result = await this.prismaService.config.findMany({
        where: {
          key: {
            in: requiredKeys,
          },
          validSince: {
            lte: new Date(),
          },
        },
        orderBy: [{ validSince: 'desc' }, { createdAt: 'desc' }],
        distinct: ['key'],
        select: {
          key: true,
          value: true,
        },
      })

      constants = Object.fromEntries(
        result.map((item) => [item.key, item.value]),
      )
    } catch (error) {
      const keysString = requiredKeys.map((key) => `'${key}'`).join(', ')
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.DATABASE_ERROR,
        ErrorsResponseEnum.DATABASE_ERROR,
        undefined,
        // eslint-disable prefer-template
        `Error while getting ${keysString} from Config.`,
        error instanceof Error ? error : undefined,
      )
    }

    requiredKeys.forEach((key) => {
      if (!constants[key]) {
        throw this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.DATABASE_ERROR,
          ErrorsResponseEnum.DATABASE_ERROR,
          undefined,
          `Could not find '${key}' settings in database. ${JSON.stringify(constants)}`,
        )
      }
    })

    return constants as { [K in T]: string }
  }

  async getVariableSymbolsByOrderIds(
    orderIds: string[],
  ): Promise<{ variableSymbol: string; orderIds: (string | null)[] }[]> {
    const result = await this.prismaService.tax.findMany({
      where: {
        taxPayments: {
          some: {
            orderId: {
              in: orderIds,
            },
          },
        },
      },
      select: {
        variableSymbol: true,
        taxPayments: {
          select: {
            orderId: true,
          },
        },
      },
    })
    return result.map((item) => ({
      variableSymbol: item.variableSymbol,
      orderIds: item.taxPayments
        .map((payment) => payment.orderId)
        .filter((orderId) => orderId !== null),
    }))
  }
}
