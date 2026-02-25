import { Injectable } from '@nestjs/common'
import { Prisma, TaxType } from '@prisma/client'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

import { NorisService } from '../../noris/noris.service'
import { PrismaService } from '../../prisma/prisma.service'
import { getTaxDefinitionByType } from '../../tax-definitions/getTaxDefinitionByType'
import DatabaseSubservice from '../../utils/subservices/database.subservice'
import { LineLoggerSubservice } from '../../utils/subservices/line-logger.subservice'

dayjs.extend(utc)
dayjs.extend(timezone)

@Injectable()
export default class TaxImportTasksService {
  private readonly logger: LineLoggerSubservice

  private readonly BRATISLAVA_TIMEZONE = 'Europe/Bratislava'

  private readonly UPLOAD_BIRTHNUMBERS_BATCH = 100

  constructor(
    private readonly prismaService: PrismaService,
    private readonly databaseSubservice: DatabaseSubservice,
    private readonly norisService: NorisService,
  ) {
    this.logger = new LineLoggerSubservice(TaxImportTasksService.name)
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
        year: todayStart.getFullYear(), // do not count historical tax loading
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
   * @param firstHistoricalYear - First year to consider for tax import
   * @param isImportPhase - If true, prioritizes users marked as ready; if false, only finds users not yet prepared
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
    const NorisCallsPerNewUser = 2 * (firstHistoricalYear - thisYear + 1)

    // Get users that have no import attempts and were never updated as a priority
    const newlyCreatedTaxPayers = await this.prismaService.$queryRaw<
      { birthNumber: string }[]
    >`
      SELECT tp."birthNumber"
      FROM "TaxPayer" tp
      WHERE NOT EXISTS (
        SELECT 1 FROM "HistoricalTaxImportAttempt" htia WHERE htia."taxPayerId" = tp."id"
      )
      AND tp."createdAt" = tp."updatedAt"
      ORDER BY tp."updatedAt" ASC
      LIMIT ${Math.floor(this.UPLOAD_BIRTHNUMBERS_BATCH / NorisCallsPerNewUser)}
    `

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
    // Check HistoricalTaxImportAttempt table instead of Tax table
    // In the preparation phase: find users without any attempt record (not yet prepared)
    // In the import phase: prioritize users with READY_TO_IMPORT status
    const existingTaxPayers = await this.prismaService.$queryRaw<
      { birthNumber: string }[]
    >`
      SELECT tp."birthNumber"
      FROM "TaxPayer" tp
      LEFT JOIN "HistoricalTaxImportAttempt" htia
        ON htia."taxPayerId" = tp.id
        AND htia.year = ${year}
        AND htia."taxType" = ${taxType}::"TaxType"
      WHERE
        -- Exclude newly created users (they're handled separately)
        NOT (tp."createdAt" = tp."updatedAt")
        ${
          isImportPhase
            ? Prisma.sql`
        -- In import phase: only include users with READY_TO_IMPORT status (prepared but not yet imported)
        AND htia.id IS NOT NULL
        AND htia.status = 'READY_TO_IMPORT'::"HistoricalTaxImportStatus"`
            : Prisma.sql`
        -- In prepare phase: only users who don't have any attempt for this year/type yet
        AND htia.id IS NULL
        -- And haven't been checked for this type at all
        AND NOT EXISTS (
          SELECT 1 FROM "HistoricalTaxImportAttempt" htia2
          WHERE htia2."taxPayerId" = tp.id
          AND htia2."taxType" = ${taxType}::"TaxType"
        )`
        }
      ORDER BY
        ${
          isImportPhase
            ? Prisma.sql`htia."updatedAt" ASC`
            : Prisma.sql`tp."updatedAt" ASC`
        }
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
    suppressEmail: boolean = false,
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
          suppressEmail,
        },
      )

    // Track import attempts in HistoricalTaxImportAttempt table
    const foundInNoris = result.foundInNoris || []
    const notFoundInNoris = birthNumbers.filter(
      (bn) => !foundInNoris.includes(bn),
    )

    // Get taxpayer IDs for birth numbers
    const taxPayers = await this.prismaService.taxPayer.findMany({
      where: {
        birthNumber: { in: birthNumbers },
      },
      select: {
        id: true,
        birthNumber: true,
      },
    })

    const birthNumberToTaxPayerId = new Map(
      taxPayers.map((tp) => [tp.birthNumber, tp.id]),
    )

    // Record successful imports
    for (const bn of result.birthNumbers) {
      const taxPayerId = birthNumberToTaxPayerId.get(bn)
      if (taxPayerId) {
        await this.prismaService.historicalTaxImportAttempt.upsert({
          where: {
            taxPayerId_year_taxType: {
              taxPayerId,
              year,
              taxType,
            },
          },
          create: {
            taxPayerId,
            year,
            taxType,
            status: 'SUCCESS',
          },
          update: {
            status: 'SUCCESS',
            updatedAt: new Date(),
            errorMessage: null,
          },
        })
      }
    }

    // Record NOT_FOUND for birth numbers not in Noris
    for (const bn of notFoundInNoris) {
      const taxPayerId = birthNumberToTaxPayerId.get(bn)
      if (taxPayerId) {
        await this.prismaService.historicalTaxImportAttempt.upsert({
          where: {
            taxPayerId_year_taxType: {
              taxPayerId,
              year,
              taxType,
            },
          },
          create: {
            taxPayerId,
            year,
            taxType,
            status: 'NOT_FOUND',
          },
          update: {
            status: 'NOT_FOUND',
            updatedAt: new Date(),
            errorMessage: null,
          },
        })
      }
    }

    this.logger.log(
      `${result.birthNumbers.length} birth numbers are successfully added to tax backend.`,
    )
  }

  /**
   * Checks if a user (by birth number) has tax in Noris for the given year. If yes, records the attempt
   * so they can be prioritized in the import phase.
   */
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

    // Track prepare attempts in HistoricalTaxImportAttempt table
    const foundInNoris = result.foundInNoris || []
    const notFoundInNoris = birthNumbers.filter(
      (bn) => !foundInNoris.includes(bn),
    )

    // Get taxpayer IDs for birth numbers
    const taxPayers = await this.prismaService.taxPayer.findMany({
      where: {
        birthNumber: { in: birthNumbers },
      },
      select: {
        id: true,
        birthNumber: true,
      },
    })

    const birthNumberToTaxPayerId = new Map(
      taxPayers.map((tp) => [tp.birthNumber, tp.id]),
    )

    // Record that taxes were found (marked as READY_TO_IMPORT during prepare phase)
    for (const bn of foundInNoris) {
      const taxPayerId = birthNumberToTaxPayerId.get(bn)
      if (taxPayerId) {
        await this.prismaService.historicalTaxImportAttempt.upsert({
          where: {
            taxPayerId_year_taxType: {
              taxPayerId,
              year,
              taxType,
            },
          },
          create: {
            taxPayerId,
            year,
            taxType,
            status: 'READY_TO_IMPORT', // Mark as ready to import during prepare phase
          },
          update: {
            status: 'READY_TO_IMPORT',
            updatedAt: new Date(),
          },
        })
      }
    }

    // Record NOT_FOUND for birth numbers not in Noris
    for (const bn of notFoundInNoris) {
      const taxPayerId = birthNumberToTaxPayerId.get(bn)
      if (taxPayerId) {
        await this.prismaService.historicalTaxImportAttempt.upsert({
          where: {
            taxPayerId_year_taxType: {
              taxPayerId,
              year,
              taxType,
            },
          },
          create: {
            taxPayerId,
            year,
            taxType,
            status: 'NOT_FOUND',
          },
          update: {
            status: 'NOT_FOUND',
            updatedAt: new Date(),
            errorMessage: null,
          },
        })
      }
    }

    this.logger.log(
      `${result.birthNumbers.length} birth numbers are prepared and ready to import.`,
    )
  }
}
