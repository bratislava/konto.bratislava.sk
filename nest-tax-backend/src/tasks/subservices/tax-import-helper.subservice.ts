import { Injectable } from '@nestjs/common'
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

  /**
   * Get import window config values
   */
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

  /**
   * Check if current time is within the import window (7:00-20:00)
   */
  async isWithinImportWindow(): Promise<boolean> {
    const now = dayjs().tz(this.BRATISLAVA_TIMEZONE)
    const hour = now.hour()
    const { startHour, endHour } = await this.getImportWindowConfig()
    return hour >= startHour && hour < endHour
  }

  /**
   * Get count of taxes created today (based on createdAt)
   */
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

  /**
   * Mark birth numbers as ready to import
   */
  async markAsReadyToImport(birthNumbers: string[]): Promise<void> {
    if (birthNumbers.length === 0) {
      return
    }

    await this.prismaService.taxPayer.updateMany({
      where: {
        birthNumber: { in: birthNumbers },
      },
      data: {
        readyToImport: true,
      },
    })
  }

  /**
   * Clear readyToImport flag after successful import
   */
  async clearReadyToImport(birthNumbers: string[]): Promise<void> {
    if (birthNumbers.length === 0) {
      return
    }

    await this.prismaService.taxPayer.updateMany({
      where: {
        birthNumber: { in: birthNumbers },
      },
      data: {
        readyToImport: false,
      },
    })
  }

  /**
   * Get the daily tax limit from config
   */
  async getDailyTaxLimit(): Promise<number> {
    const config = await this.databaseSubservice.getConfigByKeys([
      'TAX_IMPORT_DAILY_LIMIT',
    ])
    return parseInt(config.TAX_IMPORT_DAILY_LIMIT, 10)
  }

  /**
   * Get prioritized birth numbers for tax import with metadata
   */
  async getPrioritizedBirthNumbersWithMetadata(year: number): Promise<{
    birthNumbers: string[]
    newlyCreated: string[]
  }> {
    const prioritized = await this.prismaService.$queryRaw<
      { birthNumber: string; isNewlyCreated: boolean }[]
    >`
      SELECT tp."birthNumber", (tp."createdAt" = tp."updatedAt") as "isNewlyCreated"
      FROM "TaxPayer" tp
      WHERE NOT EXISTS (
        SELECT 1
        FROM "Tax" t
        WHERE t."taxPayerId" = tp."id" AND t."year" = ${year}
      )
      ORDER BY (tp."createdAt" = tp."updatedAt") DESC, tp."readyToImport" DESC, tp."updatedAt" ASC
      LIMIT ${this.UPLOAD_BIRTHNUMBERS_BATCH}
    `

    const birthNumbers = prioritized.map((p) => p.birthNumber)
    const newlyCreated = prioritized
      .filter((p) => p.isNewlyCreated)
      .map((p) => p.birthNumber)

    return { birthNumbers, newlyCreated }
  }

  /**
   * Import taxes for the given birth numbers
   */
  async importTaxes(birthNumbers: string[], year: number): Promise<void> {
    if (birthNumbers.length === 0) {
      return
    }

    const result =
      await this.norisService.getAndProcessNewNorisTaxDataByBirthNumberAndYear({
        year,
        birthNumbers,
        options: {
          prepareOnly: false,
        },
      })

    // Clear readyToImport flag for successfully imported birth numbers
    await this.clearReadyToImport(result.birthNumbers)

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

  /**
   * Prepare taxes for the given birth numbers (validate but don't create)
   */
  async prepareTaxes(birthNumbers: string[], year: number): Promise<void> {
    if (birthNumbers.length === 0) {
      return
    }

    const result =
      await this.norisService.getAndProcessNewNorisTaxDataByBirthNumberAndYear({
        year,
        birthNumbers,
        options: {
          prepareOnly: true,
        },
      })

    // Mark validated birth numbers as ready to import
    await this.markAsReadyToImport(result.birthNumbers)

    this.logger.log(
      `${result.birthNumbers.length} birth numbers are prepared and ready to import.`,
    )
  }
}
