import { Injectable } from '@nestjs/common'
import { HistoricalTaxImportStatus, TaxType } from '@prisma/client'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

import { NorisService } from '../../noris/noris.service'
import { PrismaService } from '../../prisma/prisma.service'
import DatabaseSubservice from '../../utils/subservices/database.subservice'
import { LineLoggerSubservice } from '../../utils/subservices/line-logger.subservice'

dayjs.extend(utc)
dayjs.extend(timezone)

@Injectable()
export default class TaxImportHelperService {
  private readonly logger: LineLoggerSubservice

  private readonly BRATISLAVA_TIMEZONE = 'Europe/Bratislava'

  private readonly UPLOAD_BIRTHNUMBERS_BATCH = 100

  constructor(
    private readonly prismaService: PrismaService,
    private readonly databaseSubservice: DatabaseSubservice,
    private readonly norisService: NorisService,
  ) {
    this.logger = new LineLoggerSubservice(TaxImportHelperService.name)
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

  async getTodayTaxCount(year?: number): Promise<number> {
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
        year,
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
   * @param firstHistoricalYear - First year of historical data to import
   * @param isImportPhase - If true, prioritizes readyToImport=1; if false, orders only by lastUpdatedAtDatabaseFieldName
   * @returns {Object} - The prioritized birth numbers and newly created birth numbers (imported immediately), these sets are disjoint
   */
  async getPrioritizedBirthNumbersWithMetadata(
    taxType: TaxType,
    year: number,
    firstHistoricalYear: number,
    isImportPhase: boolean = true,
  ): Promise<{
    birthNumbers: string[]
    newlyCreated: string[]
  }> {
    const thisYear = new Date().getFullYear()
    // (number of tax types: 2) * (number of years to be imported: delta including initial)
    const NorisCallsPerNewUser = 2 * (firstHistoricalYear - thisYear + 1)

    // Get users that have no taxes loaded and were never updated as a priority
    // For these users we will load all historical taxes at the same time
    const newlyCreatedTaxPayers = await this.prismaService.taxPayer.findMany({
      where: {
        createdAt: { equals: this.prismaService.taxPayer.fields.updatedAt },
        taxImportAttempts: { none: {} },
      },
      select: { birthNumber: true },
      orderBy: { updatedAt: 'asc' },
      take: Math.floor(this.UPLOAD_BIRTHNUMBERS_BATCH / NorisCallsPerNewUser),
    })

    const remainingCapacity =
      this.UPLOAD_BIRTHNUMBERS_BATCH -
      newlyCreatedTaxPayers.length * NorisCallsPerNewUser

    if (remainingCapacity === 0) {
      return {
        newlyCreated: newlyCreatedTaxPayers.map((u) => u.birthNumber),
        birthNumbers: [],
      }
    }

    // Then get existing users for the remaining capacity.
    // Check TaxImportAttempt table instead of Tax table
    // In the preparation phase: find users without any attempt record (not yet prepared)
    // In the import phase: prioritize users with READY_TO_IMPORT status
    let existingTaxPayers: { birthNumber: string }[]
    if (isImportPhase) {
      existingTaxPayers = await this.prismaService.$queryRaw<
        { birthNumber: string }[]
        //language=postgresql
      >`
          SELECT tp."birthNumber"
          FROM "TaxPayer" tp
                   LEFT JOIN "TaxImportAttempt" tia
                             ON tia."taxPayerId" = tp.id
                                 AND tia.year = ${year}
                                 AND tia."taxType" = ${taxType}::"TaxType"
          WHERE
            -- Exclude newly created users (they're handled separately)
              NOT (tp."createdAt" = tp."updatedAt")

            AND (tia.status = 'READY_TO_IMPORT'::"HistoricalTaxImportStatus"
              OR tia.id IS NULL)
          ORDER BY CASE
                       WHEN tia.status = 'READY_TO_IMPORT'::"HistoricalTaxImportStatus"
                           THEN 1
                       ELSE 0
                       END DESC,
                   tia."updatedAt" NULLS FIRST,
                   tp."updatedAt"
          LIMIT ${remainingCapacity}
      `
    } else {
      existingTaxPayers = await this.prismaService.$queryRaw<
        { birthNumber: string }[]
        //language=postgresql
      >`
          SELECT tp."birthNumber"
          FROM "TaxPayer" tp
                   LEFT JOIN "TaxImportAttempt" tia
                             ON tia."taxPayerId" = tp.id
                                 AND tia.year = ${year}
                                 AND tia."taxType" = ${taxType}::"TaxType"
          WHERE
            -- Exclude newly created users (they're handled separately)
              NOT (tp."createdAt" = tp."updatedAt")
            -- In prepare phase: only users who don't have any attempt for this year/type yet
            AND tia.id IS NULL
          ORDER BY tp."updatedAt"
          LIMIT ${remainingCapacity}
      `
    }

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

    const yearIsCurrent = year === new Date().getFullYear()
    const result =
      await this.norisService.getAndProcessNewNorisTaxDataByBirthNumberAndYear(
        taxType,
        year,
        birthNumbers,
        {
          prepareOnly: false,
          suppressEmail: !yearIsCurrent,
        },
      )

    // Move only the birth numbers which are not found in Noris to the end of the queue
    const foundInNoris = result.foundInNoris || []
    const notFoundInNoris = birthNumbers.filter(
      (bn) => !foundInNoris.includes(bn),
    )

    if (notFoundInNoris.length > 0) {
      await this.prismaService.taxImportAttempt.updateMany({
        where: {
          taxPayer: {
            birthNumber: { in: notFoundInNoris },
          },
          year,
          taxType,
        },
        data: {
          updatedAt: new Date(),
          status: HistoricalTaxImportStatus.NOT_FOUND,
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
          suppressEmail: true,
        },
      )

    this.logger.log(
      `${result.birthNumbers.length} birth numbers are prepared and ready to import.`,
    )
  }
}
