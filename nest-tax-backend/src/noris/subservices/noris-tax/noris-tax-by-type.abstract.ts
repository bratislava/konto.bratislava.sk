import { Prisma } from '@prisma/client'
import { ResponseUserByBirthNumberDto } from 'openapi-clients/city-account'

import { CreateBirthNumbersResponseDto } from '../../../admin/dtos/responses.dto'
import { BloomreachService } from '../../../bloomreach/bloomreach.service'
import { PrismaService } from '../../../prisma/prisma.service'
import { TaxDefinition } from '../../../tax-definitions/taxDefinitionsTypes'
import { ErrorsEnum } from '../../../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../../../utils/guards/errors.guard'
import { LineLoggerSubservice } from '../../../utils/subservices/line-logger.subservice'
import { QrCodeSubservice } from '../../../utils/subservices/qrcode.subservice'
import { TaxWithTaxPayer } from '../../../utils/types/types.prisma'
import { NorisTaxPayersDto } from '../../noris.dto'
import {
  convertCurrencyToInt,
  mapNorisToTaxAdministratorData,
  mapNorisToTaxInstallmentsData,
  mapNorisToTaxPayerData,
} from '../../utils/mapping.helper'

export abstract class NorisTaxByType {
  constructor(
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
    norisData: NorisTaxPayersDto[],
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
    taxDefinition: TaxDefinition,
    dataFromNoris: NorisTaxPayersDto,
    year: number,
    transaction: Prisma.TransactionClient,
    userDataFromCityAccount: ResponseUserByBirthNumberDto | null,
  ): Promise<TaxWithTaxPayer> {
    const taxAdministratorData = mapNorisToTaxAdministratorData(dataFromNoris)
    const taxAdministrator = await transaction.taxAdministrator.upsert({
      where: {
        id: dataFromNoris.vyb_id,
      },
      create: taxAdministratorData,
      update: taxAdministratorData,
    })

    const taxPayerData = mapNorisToTaxPayerData(dataFromNoris, taxAdministrator)
    const taxPayer = await transaction.taxPayer.upsert({
      where: {
        birthNumber: dataFromNoris.ICO_RC,
      },
      create: taxPayerData,
      update: taxPayerData,
    })

    const [qrCodeEmail, qrCodeWeb] = await Promise.all([
      this.qrCodeSubservice.createQrCode({
        amount: convertCurrencyToInt(dataFromNoris.dan_spolu),
        variableSymbol: dataFromNoris.variabilny_symbol,
        specificSymbol: '2024100000',
      }),
      this.qrCodeSubservice.createQrCode({
        amount: convertCurrencyToInt(dataFromNoris.dan_spolu),
        variableSymbol: dataFromNoris.variabilny_symbol,
        specificSymbol: '2024200000',
      }),
    ])

    // deliveryMethod is missing here, since we do not want to update
    // historical taxes with the current delivery method in Noris
    const taxData = taxDefinition.mapNorisToTaxData(
      dataFromNoris,
      year,
      taxPayer.id,
      qrCodeEmail,
      qrCodeWeb,
    )

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
      update: taxData,
      create: {
        ...taxData,
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

    const taxDetailData = taxDefinition.mapNorisToTaxDetailData(
      dataFromNoris,
      tax.id,
    )

    await transaction.taxDetail.createMany({
      data: taxDetailData,
    })
    return tax
  }

  protected readonly processTaxRecordFromNoris = async (
    taxDefinition: TaxDefinition,
    birthNumbersResult: Set<string>,
    norisItem: NorisTaxPayersDto,
    userDataFromCityAccount: Record<string, ResponseUserByBirthNumberDto>,
    year: number,
  ) => {
    birthNumbersResult.add(norisItem.ICO_RC)

    try {
      await this.prismaService.$transaction(async (tx) => {
        const userFromCityAccount =
          userDataFromCityAccount[norisItem.ICO_RC] || null

        if (!userFromCityAccount) {
          return
        }

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
