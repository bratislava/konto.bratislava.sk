import { Injectable } from '@nestjs/common'
import { Prisma, TaxType } from '@prisma/client'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

import { NorisService } from '../../noris/noris.service'
import { PrismaService } from '../../prisma/prisma.service'
import DatabaseSubservice from '../../utils/subservices/database.subservice'
import { LineLoggerSubservice } from '../../utils/subservices/line-logger.subservice'
import { getTaxDefinitionByType } from '../../tax-definitions/getTaxDefinitionByType'

dayjs.extend(utc)
dayjs.extend(timezone)

@Injectable()
export default class TaxImportHelperSubservice {
  private readonly logger: LineLoggerSubservice

  private readonly BRATISLAVA_TIMEZONE = 'Europe/Bratislava'

  private readonly UPLOAD_BIRTHNUMBERS_BATCH = 100

  constructor(
    private readonly prismaService: PrismaService,
    private readonly databaseSubservice: DatabaseSubservice,
    private readonly norisService: NorisService,
  ) {
    this.logger = new LineLoggerSubservice(TaxImportHelperSubservice.name)
  }

  private async getImportWindowConfig(): Promise<{
    startHour: number
    endHour: number
  }> {
    const config = await this.databaseSubservice.getConfigByKeys([
      'TAX_IMPORT_WINDOW_START_HOUR',
      'TAX_IMPORT_WINDOW_END_HOUR',
    ])
    return {
      startHour: parseInt(config.TAX_IMPORT_WINDOW_START_HOUR, 10),
      endHour: parseInt(config.TAX_IMPORT_WINDOW_END_HOUR, 10),
    }
  }

  async isWithinImportWindow(): Promise<boolean> {
    const now = dayjs().tz(this.BRATISLAVA_TIMEZONE)
    const hour = now.hour()
    const { startHour, endHour } = await this.getImportWindowConfig()
    return hour >= startHour && hour < endHour
  }

  async getTodayTaxCount(): Promise<number> {
    const todayStart = dayjs()
      .tz(this.BRATISLAVA_TIMEZONE)
      .startOf('day')
      .toDate()
    const todayEnd = dayjs().tz(this.BRATISLAVA_TIMEZONE).endOf('day').toDate()

    return this.prismaService.tax.count({
      where: {
        createdAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    })
  }

  async clearReadyToImport(
    taxType: TaxType,
    birthNumbers: string[],
  ): Promise<void> {
    if (birthNumbers.length === 0) {
      return
    }

    const { readyToImportFieldName } = getTaxDefinitionByType(taxType)

    await this.prismaService.taxPayer.updateMany({
      where: {
        birthNumber: { in: birthNumbers },
      },
      data: {
        [readyToImportFieldName]: false,
      },
    })
  }

  async getDailyTaxLimit(): Promise<number> {
    const config = await this.databaseSubservice.getConfigByKeys([
      'TAX_IMPORT_DAILY_LIMIT',
    ])
    return parseInt(config.TAX_IMPORT_DAILY_LIMIT, 10)
  }

  /**
   * Get prioritized birth numbers for tax import with metadata
   * @param taxType - Type of tax
   * @param year - The tax year
   * @param isImportPhase - If true, prioritizes readyToImport=1; if false, orders only by updatedAt
   * @returns {Object} - The prioritized birth numbers and newly created birth numbers (imported immediately), these sets are disjoint
   */
  async getPrioritizedBirthNumbersWithMetadata(
    taxType: TaxType,
    year: number,
    isImportPhase: boolean = true,
  ): Promise<{
    birthNumbers: string[]
    newlyCreated: string[]
  }> {
    // Determine which readyToImport field to use
    const { readyToImportFieldName } = getTaxDefinitionByType(taxType)

    // Get users that have no taxes loaded and were never updated as a priority
    const newlyCreatedTaxPayers = await this.prismaService.$queryRaw<
      { birthNumber: string }[]
    >`
      SELECT tp."birthNumber"
      FROM "TaxPayer" tp
      WHERE NOT EXISTS (
        SELECT 1 FROM "Tax" t WHERE t."taxPayerId" = tp."id"
      )
        AND tp."createdAt" = tp."updatedAt"
      ORDER BY tp."updatedAt" ASC
      LIMIT ${Math.floor(this.UPLOAD_BIRTHNUMBERS_BATCH / 2)}
    `

    const remainingCapacity =
      this.UPLOAD_BIRTHNUMBERS_BATCH - newlyCreatedTaxPayers.length * 2

    if (remainingCapacity == 0) {
      return {
        newlyCreated: newlyCreatedTaxPayers.map((u) => u.birthNumber),
        birthNumbers: [],
      }
    }

    // Then get existing users for the remaining capacity.
    // In the preparation phase ignore already prepared
    // In the import phase prioritize marked as ready to import
    const existingTaxPayers = await this.prismaService.$queryRaw<
      { birthNumber: string }[]
    >`
      SELECT tp."birthNumber"
      FROM "TaxPayer" tp
      WHERE EXISTS (
        SELECT 1
        FROM "Tax" t
        WHERE t."taxPayerId" = tp."id" AND t."year" = ${year} AND t."type" = ${taxType}::"TaxType"
      )
      AND NOT tp."createdAt" = tp."updatedAt"
      ${isImportPhase ? Prisma.empty : Prisma.sql`AND tp.${Prisma.raw(`"${readyToImportFieldName}"`)} = FALSE`}
      ORDER BY 
        ${isImportPhase ? Prisma.sql`tp.${Prisma.raw(`"${readyToImportFieldName}"::INT`)} DESC` : Prisma.empty},
        tp."updatedAt" ASC
      LIMIT ${remainingCapacity}
    `

    return {
      birthNumbers: existingTaxPayers.map((tp) => tp.birthNumber),
      newlyCreated: newlyCreatedTaxPayers.map((tp) => tp.birthNumber),
    }
  }

  async importTaxes(
    taxType: TaxType,
    birthNumbers: string[],
    year: number,
  ): Promise<void> {
    if (birthNumbers.length === 0) {
      return
    }

    const result =
      await this.norisService.getAndProcessNewNorisTaxDataByBirthNumberAndYear(
        taxType,
        year,
        birthNumbers,
        {
          prepareOnly: false,
        },
      )

    // Clear readyToImport flag for successfully imported birth numbers
    await this.clearReadyToImport(taxType, result.birthNumbers)

    // Move only birth numbers not found in Noris to the end of the queue
    const foundInNoris = result.foundInNoris || []
    const notFoundInNoris = birthNumbers.filter(
      (bn) => !foundInNoris.includes(bn),
    )
    if (notFoundInNoris.length > 0) {
      await this.prismaService.taxPayer.updateMany({
        where: {
          birthNumber: { in: notFoundInNoris },
        },
        data: {
          updatedAt: new Date(),
        },
      })
    }

    this.logger.log(
      `${result.birthNumbers.length} birth numbers are successfully added to tax backend.`,
    )
  }

  async prepareTaxes(
    taxType: TaxType,
    birthNumbers: string[],
    year: number,
  ): Promise<void> {
    if (birthNumbers.length === 0) {
      return
    }

    const result =
      await this.norisService.getAndProcessNewNorisTaxDataByBirthNumberAndYear(
        taxType,
        year,
        birthNumbers,
        {
          prepareOnly: true,
        },
      )

    // Move birth numbers to the end of the queue
    if (birthNumbers.length > 0) {
      await this.prismaService.taxPayer.updateMany({
        where: {
          birthNumber: { in: birthNumbers },
        },
        data: {
          updatedAt: new Date(),
        },
      })
    }

    this.logger.log(
      `${result.birthNumbers.length} birth numbers are prepared and ready to import.`,
    )
  }
}
