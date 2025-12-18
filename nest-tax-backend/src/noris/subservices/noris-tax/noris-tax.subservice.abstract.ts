import { Prisma, TaxType } from '@prisma/client'
import groupBy from 'lodash/groupBy'
import { ResponseUserByBirthNumberDto } from 'openapi-clients/city-account'
import pLimit from 'p-limit'

import { RequestPostNorisLoadDataOptionsDto } from '../../../admin/dtos/requests.dto'
import { CreateBirthNumbersResponseDto } from '../../../admin/dtos/responses.dto'
import { BloomreachService } from '../../../bloomreach/bloomreach.service'
import { PrismaService } from '../../../prisma/prisma.service'
import { getTaxDefinitionByType } from '../../../tax-definitions/getTaxDefinitionByType'
import {
  TaxDefinition,
  TaxTypeToNorisData,
} from '../../../tax-definitions/taxDefinitionsTypes'
import { ErrorsEnum } from '../../../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../../../utils/guards/errors.guard'
import { CityAccountSubservice } from '../../../utils/subservices/cityaccount.subservice'
import DatabaseSubservice from '../../../utils/subservices/database.subservice'
import { LineLoggerSubservice } from '../../../utils/subservices/line-logger.subservice'
import { QrCodeSubservice } from '../../../utils/subservices/qrcode.subservice'
import { TaxWithTaxPayer } from '../../../utils/types/types.prisma'
import {
  convertCurrencyToInt,
  mapNorisToDatabaseBaseTax,
  mapNorisToTaxAdministratorData,
  mapNorisToTaxInstallmentsData,
  mapNorisToTaxPayerData,
} from '../../utils/mapping.helper'
import { NorisPaymentSubservice } from '../noris-payment.subservice'

export abstract class AbstractNorisTaxSubservice<TTaxType extends TaxType> {
  protected readonly concurrency = Number(process.env.DB_CONCURRENCY ?? 10)

  protected readonly concurrencyLimit = pLimit(this.concurrency)

  protected constructor(
    protected readonly qrCodeSubservice: QrCodeSubservice,
    protected readonly prismaService: PrismaService,
    protected readonly bloomreachService: BloomreachService,
    protected readonly throwerErrorGuard: ThrowerErrorGuard,
    protected readonly databaseSubservice: DatabaseSubservice,
    protected readonly logger: LineLoggerSubservice,
    protected readonly cityAccountSubservice: CityAccountSubservice,
    protected readonly paymentSubservice: NorisPaymentSubservice,
  ) {}

  /**
   * Gets the tax definition for this tax type.
   */
  protected getTaxDefinition(): TaxDefinition<TTaxType> {
    return getTaxDefinitionByType(this.getTaxType())
  }

  /**
   * Gets the tax type for this subservice.
   * Must be implemented by subclasses.
   */
  protected abstract getTaxType(): TTaxType

  /**
   * Gets the tax data from Noris for given birth numbers and year.
   *
   * @param year - Year of the taxes
   * @param birthNumbers - Birth numbers of the tax payers to get data for
   * @returns Tax data from Noris
   */
  protected abstract getTaxDataByYearAndBirthNumber(
    year: number,
    birthNumbers: string[],
  ): Promise<TaxTypeToNorisData[TTaxType][]>

  protected async filterNorisDataNotInDatabase(
    norisData: TaxTypeToNorisData[TTaxType][],
    year: number,
  ): Promise<TaxTypeToNorisData[TTaxType][]> {
    const taxDefinition = this.getTaxDefinition()
    const selectQuery = taxDefinition.isUnique
      ? {
          taxPayer: {
            select: {
              birthNumber: true,
            },
          },
        }
      : {
          variableSymbol: true,
        }
    const taxesExist = await this.prismaService.tax.findMany({
      select: selectQuery,
      where: {
        year: +year,
        taxPayer: {
          birthNumber: {
            in: norisData.map((norisRecord) => norisRecord.ICO_RC),
          },
        },
        type: taxDefinition.type,
      },
    })
    const existingTaxIdentifiers = new Set(
      taxDefinition.isUnique
        ? taxesExist.map((tax) => tax.taxPayer.birthNumber)
        : taxesExist.map((tax) => tax.variableSymbol),
    )
    return norisData.filter((norisItem) =>
      taxDefinition.isUnique
        ? !existingTaxIdentifiers.has(norisItem.ICO_RC)
        : !existingTaxIdentifiers.has(norisItem.variabilny_symbol),
    )
  }

  /**
   * Processes the tax data from Noris to insert into the database.
   *
   * @param norisData - Tax data from Noris
   * @param year - Year of the taxes
   * @returns CreateBirthNumbersResponseDto containing birth numbers of the tax payers that were processed
   */
  async processNorisTaxData(
    norisData: TaxTypeToNorisData[TTaxType][],
    year: number,
    options: RequestPostNorisLoadDataOptionsDto,
  ): Promise<CreateBirthNumbersResponseDto> {
    const birthNumbersResult: Set<string> = new Set()
    const { prepareOnly = false, ignoreBatchLimit = false } = options

    this.logger.log(
      `Data loaded from noris - count ${norisData.length}, prepareOnly: ${prepareOnly}, ignoreBatchLimit: ${ignoreBatchLimit}`,
    )

    const taxDefinition = this.getTaxDefinition()

    const norisDataNotInDatabase = await this.filterNorisDataNotInDatabase(
      norisData,
      year,
    )

    if (prepareOnly) {
      // In prepare mode, mark birth numbers as ready to import, and return them
      // No need to check for userFromCityAccount - that will be validated during actual import
      const birthNumbers = norisDataNotInDatabase.map(
        (norisItem) => norisItem.ICO_RC,
      )
      await this.prismaService.taxPayer.updateMany({
        where: {
          birthNumber: { in: birthNumbers },
        },
        data: {
          [taxDefinition.readyToImportFieldName]: true,
        },
      })
      return { birthNumbers }
    }

    // Normal mode: process and create taxes
    const batchSizeLimit = ignoreBatchLimit
      ? undefined
      : await this.getBatchSizeLimit()

    // Limit the number of unique tax payers to process in this batch
    // All taxes for the first x unique tax payers will be included
    let recordsToProcess: TaxTypeToNorisData[TTaxType][]
    if (batchSizeLimit === undefined) {
      recordsToProcess = norisDataNotInDatabase
    } else {
      const taxesByTaxPayer = groupBy(norisDataNotInDatabase, 'ICO_RC')
      const uniqueTaxPayers = Object.keys(taxesByTaxPayer).slice(
        0,
        batchSizeLimit,
      )
      recordsToProcess = uniqueTaxPayers.flatMap(
        (birthNumber) => taxesByTaxPayer[birthNumber],
      )

      const uniqueTaxPayersCount = Object.keys(taxesByTaxPayer).length
      if (uniqueTaxPayersCount > batchSizeLimit) {
        this.logger.log(
          `Limiting batch processing to ${batchSizeLimit} unique tax payers (${recordsToProcess.length} taxes) out of ${uniqueTaxPayersCount} unique tax payers (${norisDataNotInDatabase.length} taxes) available`,
        )
      }
    }

    const userDataFromCityAccount =
      await this.cityAccountSubservice.getUserDataAdminBatch(
        recordsToProcess.map((norisRecord) => norisRecord.ICO_RC),
      )

    await Promise.all(
      recordsToProcess.map(async (norisItem) =>
        this.concurrencyLimit(async () => {
          await this.processTaxRecordFromNoris(
            taxDefinition,
            birthNumbersResult,
            norisItem,
            userDataFromCityAccount,
            year,
          )
        }),
      ),
    )

    // Add the payments only for processed taxes
    await this.paymentSubservice.updatePaymentsFromNorisWithData(
      recordsToProcess,
    )

    return { birthNumbers: [...birthNumbersResult] }
  }

  /**
   * Gets the tax data from Noris and updates the existing records in the database.
   *
   * @param year - Year of the taxes
   * @param birthNumbers - Birth numbers of the tax payers to update
   * @returns Number of records that were updated
   */
  abstract getNorisTaxDataByBirthNumberAndYearAndUpdateExistingRecords(
    year: number,
    birthNumbers: string[],
  ): Promise<{ updated: number }>

  /**
   * Gets the tax data from Noris and processes it by inserting into the database.
   *
   * @param year - Year of the taxes
   * @param birthNumbers - Birth numbers of the tax payers to process
   * @returns Birth numbers of the tax payers that were processed
   */
  async getAndProcessNorisTaxDataByBirthNumberAndYear(
    year: number,
    birthNumbers: string[],
    options: RequestPostNorisLoadDataOptionsDto = {},
  ): Promise<CreateBirthNumbersResponseDto> {
    this.logger.log('Start Loading data from noris')
    const norisData = await this.getTaxDataByYearAndBirthNumber(
      year,
      birthNumbers,
    )

    const birthNumbersResult = await this.processNorisTaxData(
      norisData,
      year,
      options,
    )

    // Include birth numbers found in Noris (regardless of whether they were processed)
    return {
      ...birthNumbersResult,
      foundInNoris: [...new Set(norisData.map((item) => item.ICO_RC))],
    }
  }

  protected async getBatchSizeLimit(): Promise<number | undefined> {
    try {
      const config = await this.databaseSubservice.getConfigByKeys([
        'TAX_IMPORT_BATCH_SIZE',
      ])
      const batchSizeLimit = parseInt(config.TAX_IMPORT_BATCH_SIZE, 10)
      if (Number.isNaN(batchSizeLimit) || batchSizeLimit < 0) {
        this.logger.warn(
          `Invalid TAX_IMPORT_BATCH_SIZE config value: ${config.TAX_IMPORT_BATCH_SIZE}, processing all tax payers`,
        )
        return undefined
      }
      return batchSizeLimit
    } catch (error) {
      this.logger.warn(
        'Failed to get TAX_IMPORT_BATCH_SIZE config, processing all tax payers',
      )
      return undefined
    }
  }

  /**
   * Inserts the tax data into the database.
   *
   * @param taxDefinition - Tax definition
   * @param dataFromNoris - Tax data from Noris
   * @param year - Year of the taxes
   * @param transaction - Transaction client
   * @param userDataFromCityAccount - User data from City Account
   * @returns The tax data that was inserted into the database, along with info about the tax payer.
   */
  protected async insertTaxDataToDatabase(
    taxDefinition: TaxDefinition<TTaxType>,
    dataFromNoris: TaxTypeToNorisData[TTaxType],
    year: number,
    transaction: Prisma.TransactionClient,
    userDataFromCityAccount: ResponseUserByBirthNumberDto | null,
  ): Promise<TaxWithTaxPayer> {
    const taxAdministratorData = mapNorisToTaxAdministratorData(dataFromNoris)
    const taxAdministrator = taxAdministratorData
      ? await transaction.taxAdministrator.upsert({
          where: {
            id: taxAdministratorData.id,
          },
          create: taxAdministratorData,
          update: taxAdministratorData,
        })
      : undefined

    const taxPayerData = mapNorisToTaxPayerData(dataFromNoris)
    const taxPayer = await transaction.taxPayer.upsert({
      where: {
        birthNumber: dataFromNoris.ICO_RC,
      },
      create: taxPayerData,
      update: taxPayerData,
    })

    if (taxAdministrator?.id) {
      const taxPayerTaxAdministratorData = {
        taxPayerId: taxPayer.id,
        taxAdministratorId: taxAdministrator.id,
        taxType: taxDefinition.type,
      }
      await transaction.taxPayerTaxAdministrator.upsert({
        where: {
          taxPayerId_taxType: {
            taxPayerId: taxPayer.id,
            taxType: taxDefinition.type,
          },
        },
        create: taxPayerTaxAdministratorData,
        update: taxPayerTaxAdministratorData,
      })
    }

    // deliveryMethod is missing here, since we do not want to update
    // historical taxes with the current delivery method in Noris
    const taxDataBase = mapNorisToDatabaseBaseTax(
      dataFromNoris,
      year,
      taxPayer.id,
    )

    const taxDetails = taxDefinition.mapNorisToTaxDetailData(dataFromNoris)

    const whereUnique: Prisma.TaxWhereUniqueInput = {
      ...(taxDefinition.isUnique
        ? {
            taxPayerId_year_type_order: {
              taxPayerId: taxPayer.id,
              year,
              type: taxDefinition.type,
              order: 1,
            },
          }
        : {
            variableSymbol: dataFromNoris.variabilny_symbol,
          }),
    }
    const tax = await transaction.tax.upsert({
      where: whereUnique,
      update: { ...taxDataBase, taxDetails },
      create: {
        ...taxDataBase,
        taxDetails,
        type: taxDefinition.type,
        deliveryMethod: userDataFromCityAccount?.taxDeliveryMethodAtLockDate,
      },
      include: {
        taxPayer: true,
      },
    })

    const taxInstallments = mapNorisToTaxInstallmentsData(dataFromNoris, tax.id)
    await transaction.taxInstallment.createMany({
      data: taxInstallments,
    })

    return tax
  }

  protected readonly processTaxRecordFromNoris = async (
    taxDefinition: TaxDefinition<TTaxType>,
    birthNumbersResult: Set<string>,
    norisItem: TaxTypeToNorisData[TTaxType],
    userDataFromCityAccount: Record<string, ResponseUserByBirthNumberDto>,
    year: number,
  ) => {
    try {
      await this.prismaService.$transaction(async (tx) => {
        const userFromCityAccount =
          userDataFromCityAccount[norisItem.ICO_RC] || null

        if (!userFromCityAccount) {
          return
        }

        birthNumbersResult.add(norisItem.ICO_RC)

        const tax = await this.insertTaxDataToDatabase(
          taxDefinition,
          norisItem,
          year,
          tx,
          userFromCityAccount,
        )

        const amountToTrack = tax.isCancelled
          ? 0
          : convertCurrencyToInt(norisItem.dan_spolu)

        const bloomreachTracker = await this.bloomreachService.trackEventTax(
          {
            amount: amountToTrack,
            year,
            delivery_method:
              userFromCityAccount.taxDeliveryMethodAtLockDate ?? null,
            taxType: taxDefinition.type,
            order: tax.order!,
          },
          userFromCityAccount.externalId ?? undefined,
        )
        if (!bloomreachTracker) {
          throw this.throwerErrorGuard.InternalServerErrorException(
            ErrorsEnum.INTERNAL_SERVER_ERROR,
            `Error in send Tax data to Bloomreach for tax payer with ID ${tax.taxPayer.id} and year ${year}`,
          )
        }
      })
    } catch (error) {
      this.logger.error(
        this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          'Failed to insert tax to database.',
          undefined,
          undefined,
          error,
        ),
      )

      // Remove the birth number from the result set if insertion fails
      birthNumbersResult.delete(norisItem.ICO_RC)
    }
  }
}
