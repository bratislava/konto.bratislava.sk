import { Injectable, Logger } from '@nestjs/common'
import { TaxType } from '@prisma/client'

import { PrismaService } from '../../prisma/prisma.service'
import TaxImportTasksService from './tax-import.tasks.service'

@Injectable()
export class TaxImportOrchestratorTasksService {
  private readonly logger: Logger

  private lastLoadedTaxType: TaxType = TaxType.DZN

  private readonly FIRST_HISTORICAL_YEAR = 2020

  constructor(
    private readonly prismaService: PrismaService,
    private readonly taxImportHelperSubservice: TaxImportTasksService,
  ) {
    this.logger = new Logger(TaxImportOrchestratorTasksService.name)
  }

  async loadTaxesForUsers() {
    this.lastLoadedTaxType =
      this.lastLoadedTaxType === TaxType.KO ? TaxType.DZN : TaxType.KO

    this.logger.log(
      `Starting LoadTaxForUsers task for TaxType: ${this.lastLoadedTaxType}`,
    )

    await this.loadTaxDataForUserByTaxType(this.lastLoadedTaxType)
  }

  private async loadTaxDataForUserByTaxType(taxType: TaxType) {
    const currentYear = new Date().getFullYear()

    const [isWithinWindow, todayTaxCount, dailyLimit] = await Promise.all([
      this.taxImportHelperSubservice.isWithinImportWindow(),
      this.taxImportHelperSubservice.getTodayTaxCount(),
      this.taxImportHelperSubservice.getDailyTaxLimit(),
    ])
    const isLimitReached = todayTaxCount >= dailyLimit
    const importPhase = isWithinWindow && !isLimitReached

    this.logger.log(
      `Time window: ${isWithinWindow ? 'OPEN' : 'CLOSED'}, Today's tax count: ${todayTaxCount}/${dailyLimit}, Phase: ${importPhase ? 'IMPORT' : 'PREPARE'}`,
    )

    const { birthNumbers, newlyCreated } =
      await this.taxImportHelperSubservice.getPrioritizedBirthNumbersWithMetadata(
        taxType,
        currentYear,
        this.FIRST_HISTORICAL_YEAR,
        importPhase,
      )

    if (newlyCreated.length > 0) {
      await this.loadTaxesForNewlyCreatedUsers(newlyCreated, currentYear)
    }

    this.logger.log(
      `Found ${newlyCreated.length} newly created users, importing all taxes immediately`,
    )

    if (birthNumbers.length > 0) {
      this.logger.log(
        `Found ${birthNumbers.length} existing users, ${importPhase ? 'importing' : 'preparing'}`,
      )
      await (importPhase
        ? this.taxImportHelperSubservice.importTaxes(
            taxType,
            birthNumbers,
            currentYear,
          )
        : this.taxImportHelperSubservice.prepareTaxes(
            taxType,
            birthNumbers,
            currentYear,
          ))
    }

    if (birthNumbers.length === 0 && newlyCreated.length === 0) {
      this.logger.log('No birth numbers found to import taxes')
    }
  }

  private async loadTaxesForNewlyCreatedUsers(
    newlyCreated: string[],
    currentYear: number,
  ) {
    if (newlyCreated.length === 0) {
      return
    }

    this.logger.log(
      `Found ${newlyCreated.length} newly created users, importing all years (${this.FIRST_HISTORICAL_YEAR}-${currentYear}) for both tax types`,
    )

    // Get taxpayer IDs for birth numbers
    const taxPayers = await this.prismaService.taxPayer.findMany({
      where: {
        birthNumber: { in: newlyCreated },
      },
      select: {
        id: true,
        birthNumber: true,
      },
    })

    const birthNumberToTaxPayerId = new Map(
      taxPayers.map((tp) => [tp.birthNumber, tp.id]),
    )

    // Get existing import attempts to avoid re-importing
    const existingAttempts =
      await this.prismaService.historicalTaxImportAttempt.findMany({
        where: {
          taxPayerId: {
            in: taxPayers.map((tp) => tp.id),
          },
        },
        select: {
          taxPayerId: true,
          year: true,
          taxType: true,
        },
      })

    const attemptedSet = new Set(
      existingAttempts.map((a) => `${a.taxPayerId}-${a.year}-${a.taxType}`),
    )

    // Load all years for both tax types, but only if not already attempted
    for (let year = this.FIRST_HISTORICAL_YEAR; year <= currentYear; year++) {
      const suppressEmail = year < currentYear

      // Filter birth numbers that haven't been attempted for DZN
      const birthNumbersToImportDZN = newlyCreated.filter((bn) => {
        const taxPayerId = birthNumberToTaxPayerId.get(bn)
        return (
          taxPayerId &&
          !attemptedSet.has(`${taxPayerId}-${year}-${TaxType.DZN}`)
        )
      })

      if (birthNumbersToImportDZN.length > 0) {
        await this.taxImportHelperSubservice.importTaxes(
          TaxType.DZN,
          birthNumbersToImportDZN,
          year,
          suppressEmail,
        )
      }

      // Filter birth numbers that haven't been attempted for KO
      const birthNumbersToImportKO = newlyCreated.filter((bn) => {
        const taxPayerId = birthNumberToTaxPayerId.get(bn)
        return (
          taxPayerId && !attemptedSet.has(`${taxPayerId}-${year}-${TaxType.KO}`)
        )
      })

      if (birthNumbersToImportKO.length > 0) {
        await this.taxImportHelperSubservice.importTaxes(
          TaxType.KO,
          birthNumbersToImportKO,
          year,
          suppressEmail,
        )
      }
    }
  }

  async loadHistoricalTaxesForExistingUsers() {
    const BATCH_SIZE = 10
    const currentYear = new Date().getFullYear()

    this.logger.log('Starting loadHistoricalTaxesForExistingUsers task')

    // Find taxpayers who have missing historical tax attempts
    // We need to find users who don't have attempts for all year/type combinations
    const taxPayersWithMissingAttempts = await this.prismaService.$queryRaw<
      { id: number; birthNumber: string; year: number; taxType: TaxType }[]
    >`
      WITH required_attempts AS (
        -- Generate all required year/type combinations for each taxpayer
        SELECT
          tp.id as "taxPayerId",
          tp."birthNumber",
          year_series.year,
          tax_type.type as "taxType"
        FROM "TaxPayer" tp
        CROSS JOIN generate_series(${this.FIRST_HISTORICAL_YEAR}, ${currentYear}) AS year_series(year)
        CROSS JOIN (
          SELECT 'DZN'::"TaxType" as type
          UNION ALL
          SELECT 'KO'::"TaxType" as type
        ) AS tax_type
        -- Only include users who have at least one tax (existing users)
        WHERE EXISTS (
          SELECT 1 FROM "Tax" t WHERE t."taxPayerId" = tp.id
        )
      ),
      missing_attempts AS (
        -- Find which required attempts are missing
        SELECT
          ra."taxPayerId",
          ra."birthNumber",
          ra.year,
          ra."taxType"
        FROM required_attempts ra
        LEFT JOIN "HistoricalTaxImportAttempt" htia
          ON htia."taxPayerId" = ra."taxPayerId"
          AND htia.year = ra.year
          AND htia."taxType" = ra."taxType"
        WHERE htia.id IS NULL
      )
      -- Prioritize current year, then descending order for historical years
      SELECT
        "taxPayerId" as id,
        "birthNumber",
        year,
        "taxType"
      FROM missing_attempts
      ORDER BY
        -- Current year first
        CASE WHEN year = ${currentYear} THEN 0 ELSE 1 END,
        -- Then most recent years first
        year DESC,
        -- Then by tax type (consistent ordering)
        "taxType" ASC,
        -- Then by taxpayer ID (consistent ordering)
        "taxPayerId" ASC
      LIMIT ${BATCH_SIZE}
    `

    if (taxPayersWithMissingAttempts.length === 0) {
      this.logger.log('No taxpayers with missing historical tax attempts found')
      return
    }

    this.logger.log(
      `Found ${taxPayersWithMissingAttempts.length} missing historical tax attempts to process`,
    )

    // Process each missing attempt
    for (const attempt of taxPayersWithMissingAttempts) {
      const suppressEmail = attempt.year < currentYear

      this.logger.log(
        `Loading historical tax for taxpayer ${attempt.birthNumber}, year ${attempt.year}, type ${attempt.taxType}`,
      )

      try {
        await this.taxImportHelperSubservice.importTaxes(
          attempt.taxType,
          [attempt.birthNumber],
          attempt.year,
          suppressEmail,
        )
      } catch (error) {
        // Log error but continue with other attempts
        this.logger.error(
          `Failed to load historical tax for taxpayer ${attempt.birthNumber}, year ${attempt.year}, type ${attempt.taxType}`,
          error,
        )

        // Record FAILED status in the tracking table
        await this.prismaService.historicalTaxImportAttempt.upsert({
          where: {
            taxPayerId_year_taxType: {
              taxPayerId: attempt.id,
              year: attempt.year,
              taxType: attempt.taxType,
            },
          },
          create: {
            taxPayerId: attempt.id,
            year: attempt.year,
            taxType: attempt.taxType,
            status: 'FAILED',
            errorMessage:
              error instanceof Error ? error.message : String(error),
          },
          update: {
            status: 'FAILED',
            errorMessage:
              error instanceof Error ? error.message : String(error),
            updatedAt: new Date(),
          },
        })
      }
    }

    this.logger.log(
      `Completed loadHistoricalTaxesForExistingUsers task, processed ${taxPayersWithMissingAttempts.length} attempts`,
    )
  }
}
