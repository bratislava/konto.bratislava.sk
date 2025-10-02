import { Prisma } from '@prisma/client'
import { ResponseUserByBirthNumberDto } from 'openapi-clients/city-account'

import { RequestPostNorisLoadDataDto } from '../../../admin/dtos/requests.dto'
import { CreateBirthNumbersResponseDto } from '../../../admin/dtos/responses.dto'
import { TaxDefinition } from '../../../tax-definitions/taxDefinitionsTypes'
import { QrCodeSubservice } from '../../../utils/subservices/qrcode.subservice'
import { NorisTaxPayersDto, NorisUpdateDto } from '../../noris.dto'
import {
  convertCurrencyToInt,
  mapNorisToTaxAdministratorData,
  mapNorisToTaxInstallmentsData,
  mapNorisToTaxPayerData,
} from '../../utils/mapping.helper'

export abstract class NorisTaxByType {
  constructor(protected readonly qrCodeSubservice: QrCodeSubservice) {}
  abstract getAndProcessNorisTaxDataByBirthNumberAndYear(
    data: RequestPostNorisLoadDataDto,
  ): Promise<CreateBirthNumbersResponseDto>

  abstract processNorisTaxData(
    norisData: NorisTaxPayersDto[],
    year: number,
  ): Promise<string[]>

  abstract getNorisTaxDataByBirthNumberAndYearAndUpdateExistingRecords(
    data: RequestPostNorisLoadDataDto,
  ): Promise<{ updated: number }>

  abstract getDataForUpdate(
    variableSymbols: string[],
    years: number[],
  ): Promise<NorisUpdateDto[]>

  protected async insertTaxPayerDataToDatabase(
    dataFromNoris: NorisTaxPayersDto,
    year: number,
    transaction: Prisma.TransactionClient,
    userDataFromCityAccount: ResponseUserByBirthNumberDto | null,
    taxDefinition: TaxDefinition,
  ) {
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
    const tax = taxDefinition.isUnique
      ? await transaction.tax.upsert({
          where: {
            taxPayerId_year_type_order: {
              taxPayerId: taxPayer.id,
              year,
              type: taxDefinition.type,
              order: 1,
            },
          },
          update: taxData,
          create: {
            ...taxData,
            type: taxDefinition.type,
            deliveryMethod:
              userDataFromCityAccount?.taxDeliveryMethodAtLockDate,
          },
        })
      : await transaction.tax.create({
          data: {
            ...taxData,
            type: taxDefinition.type,
            deliveryMethod:
              userDataFromCityAccount?.taxDeliveryMethodAtLockDate,
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
    return taxPayer
  }
}
