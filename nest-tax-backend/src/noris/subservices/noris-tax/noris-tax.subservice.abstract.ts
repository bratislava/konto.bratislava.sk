import { Prisma, TaxType } from '@prisma/client'
import { ResponseUserByBirthNumberDto } from 'openapi-clients/city-account'

import { CreateBirthNumbersResponseDto } from '../../../admin/dtos/responses.dto'
import { BloomreachService } from '../../../bloomreach/bloomreach.service'
import { PrismaService } from '../../../prisma/prisma.service'
import {
  TaxDefinition,
  TaxTypeToNorisData,
} from '../../../tax-definitions/taxDefinitionsTypes'
import { ErrorsEnum } from '../../../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../../../utils/guards/errors.guard'
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

export abstract class AbstractNorisTaxSubservice<TTaxType extends TaxType> {
  protected constructor(
    protected readonly qrCodeSubservice: QrCodeSubservice,
    protected readonly prismaService: PrismaService,
    protected readonly bloomreachService: BloomreachService,
    protected readonly throwerErrorGuard: ThrowerErrorGuard,
    protected readonly logger: LineLoggerSubservice,
  ) {}

  /**
   * Gets tax data from Noris and processes it by inserting into the database.
   *
   * @param year - Year of the taxes
   * @param birthNumbers - Birth numbers of the tax payers to process
   * @returns Birth numbers of the tax payers that were processed
   */
  abstract getAndProcessNorisTaxDataByBirthNumberAndYear(
    year: number,
    birthNumbers: string[],
  ): Promise<CreateBirthNumbersResponseDto>

  /**
   * Processes the tax data from Noris to insert into the database.
   *
   * @param norisData - Tax data from Noris
   * @param year - Year of the taxes
   * @returns Birth numbers of the tax payers that were processed
   */
  abstract processNorisTaxData(
    norisData: TaxTypeToNorisData[TTaxType][],
    year: number,
  ): Promise<string[]>

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

    const taxPayerData = mapNorisToTaxPayerData(dataFromNoris, taxAdministrator)
    const taxPayer = await transaction.taxPayer.upsert({
      where: {
        birthNumber: dataFromNoris.ICO_RC,
      },
      create: taxPayerData,
      update: taxPayerData,
    })

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

        const bloomreachTracker = await this.bloomreachService.trackEventTax(
          {
            amount: convertCurrencyToInt(norisItem.dan_spolu),
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
