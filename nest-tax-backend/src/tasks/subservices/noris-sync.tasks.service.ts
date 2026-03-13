import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Prisma, TaxType } from '@prisma/client'

import { CustomErrorNorisTypesEnum } from '../../noris/noris.errors'
import { NorisService } from '../../noris/noris.service'
import { NorisTaxPayment } from '../../noris/types/noris.types'
import { PrismaService } from '../../prisma/prisma.service'
import { getTaxDefinitionByType } from '../../tax-definitions/getTaxDefinitionByType'
import {
  MAX_NORIS_PAYMENTS_BATCH_SELECT,
  MAX_NORIS_TAXES_TO_UPDATE,
} from '../../utils/constants'
import {
  ErrorsEnum,
  ErrorsResponseEnum,
} from '../../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { LineLoggerSubservice } from '../../utils/subservices/line-logger.subservice'
import { getNextTaxType } from '../utils/tax-type-switch'

@Injectable()
export default class NorisSyncTasksService {
  private lastUpdateTaxType: TaxType = TaxType.KO

  private readonly logger: LineLoggerSubservice

  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly norisService: NorisService,
  ) {
    this.logger = new LineLoggerSubservice(NorisSyncTasksService.name)
  }

  async updatePaymentsFromNoris() {
    let variableSymbolsDb: {
      variableSymbol: string
      id: number
      year: number
    }[]

    // non-production environment is used for testing and we create taxes from endpoint `create-testing-tax`,
    // this function will overwrite the testing taxes payments which is not desired
    if (
      this.configService.getOrThrow<string>(
        'FEATURE_TOGGLE_UPDATE_TAXES_FROM_NORIS',
      ) !== 'true'
    ) {
      this.logger.log(`TasksService: Updating taxes from Noris disabled.`)
      return
    }
    try {
      variableSymbolsDb = await this.prismaService.$transaction(
        async (prisma) => {
          await prisma.$executeRaw`SET LOCAL statement_timeout = '120000'`

          return prisma.$queryRaw<
            { variableSymbol: string; id: number; year: number }[]
          >`
          SELECT t."variableSymbol", t."id", t."year"
          FROM "Tax" t
          LEFT JOIN "TaxPayment" tp ON t."id" = tp."taxId" AND tp.status = 'SUCCESS'
          GROUP BY t."id", t."variableSymbol", t."lastCheckedPayments"
          HAVING COALESCE(SUM(tp."amount"), 0) < t."amount"
          ORDER BY t."lastCheckedPayments" ASC
          LIMIT ${MAX_NORIS_PAYMENTS_BATCH_SELECT}
        `
        },
      )
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.meta?.code === '57014'
      ) {
        throw this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          'Query timed out after 2 minutes',
          undefined,
          undefined,
          error,
        )
      }
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        ErrorsResponseEnum.INTERNAL_SERVER_ERROR,
        undefined,
        undefined,
        error,
      )
    }

    if (variableSymbolsDb.length === 0) return

    const data = {
      variableSymbols: variableSymbolsDb.map(
        (variableSymbolDb) => variableSymbolDb.variableSymbol,
      ),
      years: [
        ...new Set(
          variableSymbolsDb.map((variableSymbolDb) => variableSymbolDb.year),
        ),
      ],
    }

    this.logger.log(
      `TasksService: Updating payments from Noris with data: ${JSON.stringify(data)}`,
    )

    let result: {
      created: number
      alreadyCreated: number
    }
    try {
      const norisPaymentData: NorisTaxPayment[] =
        await this.norisService.getPaymentDataFromNorisByVariableSymbols(data)
      result =
        await this.norisService.updatePaymentsFromNorisWithData(
          norisPaymentData,
        )
    } catch (error) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        CustomErrorNorisTypesEnum.UPDATE_PAYMENTS_FROM_NORIS_ERROR,
        'Failed to update payments from Noris',
        undefined,
        undefined,
        error,
      )
    }

    await this.prismaService.tax.updateMany({
      where: {
        id: {
          in: variableSymbolsDb.map((dbRecord) => dbRecord.id),
        },
      },
      data: {
        lastCheckedPayments: new Date(),
      },
    })

    this.logger.log(
      `TasksService: Updated payments from Noris, result: ${JSON.stringify(result)}`,
    )
  }

  async updateTaxesFromNoris() {
    // non-production environment is used for testing and we create taxes from endpoint `create-testing-tax`,
    // this process "updateTaxesFromNoris" will overwrite the testing taxes which is not desired
    if (
      this.configService.getOrThrow<string>(
        'FEATURE_TOGGLE_UPDATE_TAXES_FROM_NORIS',
      ) !== 'true'
    ) {
      this.logger.log(`TasksService: Updating taxes from Noris disabled.`)
      return
    }

    this.lastUpdateTaxType = getNextTaxType(this.lastUpdateTaxType)

    await this.updateTaxesFromNorisByTaxType(this.lastUpdateTaxType)
  }

  private async updateTaxesFromNorisByTaxType(taxType: TaxType) {
    const currentYear = new Date().getFullYear()
    const { lastUpdatedAtDatabaseFieldName } = getTaxDefinitionByType(taxType)

    const taxPayers = await this.prismaService.taxPayer.findMany({
      select: {
        id: true,
        birthNumber: true,
      },
      where: {
        taxes: {
          some: {
            year: currentYear,
            type: taxType,
          },
        },
      },
      orderBy: {
        [lastUpdatedAtDatabaseFieldName]: 'asc',
      },
      take: MAX_NORIS_TAXES_TO_UPDATE,
    })

    if (taxPayers.length === 0) {
      return
    }

    this.logger.log(
      `TasksService: Updating taxes from Noris for tax payers with birth numbers: ${taxPayers.map((t) => t.birthNumber).join(', ')}, tax type: ${taxType}, current year: ${currentYear}`,
    )

    const { updated } =
      await this.norisService.getNorisTaxDataByBirthNumberAndYearAndUpdateExistingRecords(
        taxType,
        currentYear,
        taxPayers.map((t) => t.birthNumber),
      )

    this.logger.log(
      `TasksService: Updated ${updated} ${taxType} taxes from Noris`,
    )

    await this.prismaService.taxPayer.updateMany({
      where: {
        id: {
          in: taxPayers.map((t) => t.id),
        },
      },
      data: {
        [lastUpdatedAtDatabaseFieldName]: new Date(),
      },
    })
  }
}
